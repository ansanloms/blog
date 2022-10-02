---
title: Raspberry Pi 4 に Ubuntu Server を導入しました
postDate: "2021-05-03T00:00:00+09:00"
---

Raspberry Pi 4 を買いました。うまれてはじめての Raspberry Pi です。

Ubuntu Server 20.04.2 LTS を導入してやっていこうとおもいます。

## 用意したもの

### 買ったもの

- [Raspberry Pi 4 Model B/8GB OKdo(RS)](https://raspberry-pi.ksyic.com/main/index/pdp.id/549,552,550,551/pdp.open/549)

本体です。 RAM 4 GB でも十分やっていきできる気がしましたが、 8 GB との値段差が 2000 円程度だったので 8 GB にしました。

- [Flirc Raspberry Pi 4 Case](https://flirc.tv/more/raspberry-pi-4-case)

ケースです。アルミのボディがかっこいいです。つめたいです。

- [Anker PowerPort+ 1 Quick Charge 3.0 & PowerIQ](https://www.ankerjapan.com/item/A2013.html)

電源です。 Raspberry Pi 4 Model B の電源要件は 5 V / 3 A なのでそれにみあうものです。

- [Amazon ベーシック USB ケーブル 0.9m (タイプ C - USB-A オス 3.1 Gen2)](https://www.amazon.co.jp/dp/B07PXRC27L)

電源ケーブルです。なんでもよかった。

### 買っていないもの

- microSD カード

おうちに SanDisk 製の 64 GB のものがころがっていたのでそれをつかうことにしました。

- SD カードリーダ

PC に SD カードスロットがあるので用意していないです。

## 用意していないもの

- マイクロ HDMI ケーブル

買うのをわすれました。

- LAN ケーブル

買うのをわすれました。

## 作業環境

- Windows 10 Pro

## 実施内容

<https://ubuntu.com/download/raspberry-pi>

Ubuntu のサイト上に[チュートリアル](https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi)が載っていました。これにそってやっていきます。

今回はマイクロ HDMI ケーブルがないので、所謂ヘッドレス状態でのセットアップとなります。あと LAN ケーブルもないので LAN には wi-fi
でつなぐことになります。

### microSD に Ubuntu Server のイメージを書きこむ

[Raspberry Pi Imager](https://www.raspberrypi.org/software/)
っやつをつかいます。これでイメージのダウンロードから microSD への書き込みまでやってくれるすごいやつです。

[scoop](https://scoop.sh/) の extas bucket にあったのでここからインストールします。

```txt
scoop install raspberry-pi-imager
```

起動したら `Operating System` から書き込む OS を選択します。

今回は `Other general purpose OS` > `Ubuntu` >
`Ubuntu Server 20.04.2 LTS (RPi 3/4/400) 64-bit` を選択しました。

続いて `Storage` で書き込む microSD カードを選択します。

`WRITE` を押下します。 microSD カードの中身が全部消える旨の Confirm がでるので、問題なければ `YES` を押下します。

問題なければ書き込みがはじまります。[チュートリアル](https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#2-prepare-the-sd-card)によると魔法がかかっちゃうらしいです。

魔法は 10 分くらいでかかりました。自動的に microSD がアンマウントされるので、再度 PC にマウントさせます。 `system-boot`
ってパーティションのみになっているはずです。

### cloud-init の設定を書き換える

初回起動時には [cloud-init](https://cloudinit.readthedocs.io/en/latest/) ってやつで OS
の初期設定がされます。その初期設定時に必要な各種設定が system-boot パーティション内に存在するので、これを書き換えていきます。

#### user-data

cloud-init におけるユーザ情報を設定します。こんなかんじで書き換えました。

```diff:user-data
 chpasswd:
   expire: true
   list:
-  - ubuntu:ubuntu
+  - ansanloms:ubuntu
+
+system_info:
+  default_user:
+    name: ansanloms

 # Enable password authentication with the SSH daemon
-ssh_pwauth: true
+ssh_pwauth: false
+ssh_authorized_keys:
+- ssh-ed25519 AAAA略
+
+# timezone
+timezone: Asia/Tokyo

 ## On first boot, use ssh-import-id to give the specific users SSH access to
 ## the default user
```

`system_info` で作成されるユーザのユーザ名を設定します。デフォルトのユーザ名ではコメントの通り `ubuntu` になります。

> By default this sets up an initial user called "ubuntu" with password
> "ubuntu",

`chpasswd` はユーザのパスワードを設定します。デフォルトのユーザ名を変更したので、ここも書き換えます。尚、デフォルトユーザのパスワードは
`ubuntu` になります。パスワードは初回ログイン時に変更を促されます。ちなみに `expire` を false
にすると、初回ログイン時にパスワード変更を実施しなくなります。

`ssh_pwauth` は ssh でのパスワード認証を有効にするかどうかの設定です。 ssh でパスワード認証をしたくないので、これを false
にします。

`ssh_authorized_keys` は ssh での公開鍵認証で使用する公開鍵を設定します。

`timezone` でタイムゾーンの設定をします。

#### network-config

cloud-init におけるネットワーク設定です。こんなかんじで書き換えました。

```diff:network-config
@@ -12,13 +12,13 @@
   eth0:
     dhcp4: true
     optional: true
-#wifis:
-#  wlan0:
-#    dhcp4: true
-#    optional: true
-#    access-points:
-#      myhomewifi:
-#        password: "S3kr1t"
+wifis:
+  wlan0:
+    dhcp4: true
+    optional: true
+    access-points:
+      "totemo sugoi ssid":
+        password: "totemosugoipassword"
 #      myworkwifi:
 #        password: "correct battery horse staple"
 #      workssid:
```

`access-points` 下に接続する wi-fi の SSID とパスワードを設定します。

### 起動する

microSD を Raspberry-pi に差し込んだ後 USB Type-C ケーブルを電源につなぎます。

これで cloud-init の処理とかがうごいている…はずです。いかんせんなにもみえないので。

### 再起動する

[チュートリアル](https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#3-wifi-or-ethernet)にもある通り、初回起動時はネットワークに接続されません。再起動後、はじめてネットワークに接続されるようです。

> Note: During the first boot, your Raspberry Pi will try to connect to this
> network. It will fail the first time around. Simply reboot sudo reboot and it
> will work.

とりあえず緑色の ACT ランプが点かなくなるまでまちました。 10 分くらいまったとおもいます。

そして、おもむろに給電の USB ケーブルを抜き、再度差し込んで再起動します。この手順あってるのかな…。

### SSH 接続する

再起動後わりとすぐに SSH 接続できるはずです。

接続先の IP アドレスを確認します。 arp コマンドで
[Raspberry Pi の MAC アドレスの範囲](https://udger.com/resources/mac-address-vendor-detail?name=raspberry_pi_foundation)と関連する
IP アドレスを調べます。

```bash
arp -a | findstr dc-a6-32
```

IP アドレスがわかったら SSH 接続を試みます。今回はデフォルトのユーザ名を変えているので、そのユーザ名で SSH 接続してみます。

```bash
ssh ansanloms@192.168.xx.xx
```

SSH ログイン成功後、 `user-data` の `chpasswd.expire` を true
にしているのならばパスワードの再設定を求められるはずなので任意設定します。

### パッケージの更新

SSH ログインできたら、とりあえずパッケージの更新をしておきます。

```bash
sudo apt update
sudo apt upgrade
```

### 完了

よかったですね。

## おわり

これからこれでいろいろやっていきたいとおもいます。

![Raspberry Pi 4](/assets/images/20210503-raspberry-pi/raspberry-pi.png)
