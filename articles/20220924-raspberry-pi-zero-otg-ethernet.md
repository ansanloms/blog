---
layout: layouts/Article.tsx
title: Raspberry Pi Zero WH を OTG でセットアップしました
date: 2022-09-24 00:00:00
---

Raspberry Pi Zero WH を買いました。

## 作業環境

- Windows 10 Pro

## 実施内容

### microSD に OS を書き込む

いつもどおり Raspberry Pi Imager で microSD に書き込みます。 OS は Raspberry Pi OS Lite (32 bit) にしました。

SSH を使いたいので、書き込む際に右下の歯車から以下の通り詳細設定をします。

- 「SSH を有効にする」にチェック。
  - 「公開鍵認証のみを許可する」を選択し、 authorized_keys を入力。
- 「ユーザ名とパスワードを設定する」にチェック。
  - 任意のユーザ名およびパスワードを入力。

### USB On-The-Go および USB Ethernet / RNDIS Gadget の有効化

書き込んだ microSD を再度マウントさせ、 `config.txt` を開き以下を追記し、 USB OTG (USB On-The-Go) を有効にします。

[USB On-The-Go](https://usb.org/usb-on-the-go) とは、 USB 機器どうしを直接接続する規格です。

```txt:config.txt
dtoverlay=dwc2
```

続いて `cmdline.txt` 内の `rootwait` 後に以下を追記し、 USB Ethernet / RNDIS Gadget を有効にします。

USB Ethernet / RNDIS Gadget とは、 [Linux-USB Gadget](http://www.linux-usb.org/gadget/) という Linux 上の USB 機器になんらかの機能を追加する仕組みを用いて、 USB でイーサネット的なことができるようにするモノです。

```txt:cmdline.txt
modules-load=dwc2,g_ether
```

### Bonjour のインストール

Windows 側に Bonjour をインストールします。 Bonjour とは、 DNS とかそういう設定とかをせずに IP アドレスにいいかんじにホスト名を割り当てるモノです。

正直入れなくていいなら入れたくないんですけど、この後に Windows に繋げた Raspberry Pi (の USB Ethernet)の IP が分からなかったので、これで名前解決てきなことをします。

<https://support.apple.com/kb/dl999>

なお Raspberry Pi OS でのデフォルトのホスト名は `raspberrypi` になります。

### Raspberry Pi を Windows に USB で接続する

Raspberry Pi Zero の USB ポート(内側)と Windows の USB を接続します。初回起動でもろもろ動くはずなので 5 分程待ちます。

初回起動後、 Windows のデバイスマネージャに `ポート(COM と LPT)` > `USB シリアルデバイス(COM n)` があるはずです。

### OTP のドライバをインストール

[RPI Driver OTG](https://caron.ws/wp-content/uploads/telechargement/RPI%20Driver%20OTG.zip)をダウンロードし、任意の場所に展開しておきます。

`USB シリアルデバイス(COM n)` の右クリックし「ドライバーの更新(P)」を選択し、 RPI Driver OTG をインストールします。

そうすると Windows にはイーサネットアダプタとして認識されるはずです。デバイスマネージャに `ネットワーク アダプター` > `USB Ethernet/RNDIS Gadget` があるはずです。

また `コントロール パネル\ネットワークとインターネット\ネットワーク接続` にもイーサネットアダプタが確認できるはずです。

### SSH 接続してみる

`ssh ユーザ名@raspberrypi.local` で接続できるはずです。あとはよしなに。

## おわり

よかったですね。

## 参考にしたドキュメント

- <https://qiita.com/msquare33/items/dc6fc9098f50d9b9dbf2>
- <https://caron.ws/diy-cartes-microcontroleurs/raspberrypi/pi-zero-otg-ethernet/>
