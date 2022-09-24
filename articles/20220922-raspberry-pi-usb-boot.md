---
layout: layouts/Article.tsx
title: Raspberry Pi 4 で USB に繋いだ SSD から起動するようにしました
date: 2022-09-22 00:00:00
---

M.2 拡張スロットが付いた Raspberry Pi 4 のケースを買ったので、SSD から起動するようにしました。

## 用意したもの

- [Argon ONE M.2 Case for Raspberry Pi 4](https://www.argon40.com/products/argon-one-m-2-case-for-raspberry-pi-4)

別途電子工作をやろうと思い立ちまして購入しました。

[前回購入したケース](https://flirc.tv/products/flirc-raspberrypi4-silver?variant=43085036454120)では GPIO ピンが見えないので新しくケースを買ったら M.2 の SSD スロットも付いていたので今回の SSD 起動をやってみようと思った次第です。

- [MMOMENT 256GB M.2 2280 SSD](https://www.amazon.co.jp/gp/product/B09W2Q1BXH)

なんかタイムセールで 3,000 円くらいだったので買えました。最悪ダメなやつだったとしてもこの値段なら諦められるかなってかんじです。

## 実施内容

SSD にも Ubuntu Server を導入しようと思います。

### microSD から Raspberry Pi OS Lite (64-bit) を起動

ブートローダの更新や SSD への書き込みの為に、先ずは microSD から Raspberry Pi の起動をします。

Raspberry Pi Imager で microSD に書き込みます。

```bash
winget install RaspberryPiFoundation.RaspberryPiImager
```

`Raspberry Pi OS Lite (64-bit)` をインストールします。

書き込む際に右下の歯車から以下の通り詳細設定をします。

- 「SSH を有効にする」にチェック。
  - 「公開鍵認証のみを許可する」を選択し、 authorized_keys を入力。
- 「Wi-Fi を設定する」にチェック。
  - 「SSID」「パスワード」「Wi-fi を使う国」をよしなに入力。

書き込んだら Raspberry Pi に microSD を差し込んで起動します。そのまま ssh 接続できるはずです。

```bash
ssh pi@192.168.x.x
```

とりいそぎ各種ライブラリの更新を行います。

```bash
$ sudo apt update
$ sudo apt upgrade
```

### ブートローダの確認

<https://github.com/raspberrypi/rpi-eeprom>

[リリースノート](https://github.com/raspberrypi/rpi-eeprom/blob/master/firmware/release-notes.md#2020-09-14-promote-the-2020-09-03-release-to-be-the-default-eeprom-images)にある通り、
2020-09-03 版以降のバージョンから USB boot をサポートしています。

現時点のブートローダのバージョンを確認します。

```bash
$ vcgencmd bootloader_version
2022/08/02 16:55:05
version 91b6280c53c0b6dff9e3d58810f439e577408845 (release)
timestamp 1659455705
update-time 1663866239
capabilities 0x0000007f
```

結論から言うと今回はブートローダの更新をする必要がありませんでした。

### ブートローダの更新

もし更新するなら以下を実施します。

`sudo apt upgrade` しておくと `/lib/firmware/raspberrypi/bootloader` 配下に eeprom
のバイナリが降ってきているはずです。

先ずは関連しているリリースチャネルを確認します。 `/etc/default/rpi-eeprom-update` を確認します。

```bash
$ cat /etc/default/rpi-eeprom-update
FIRMWARE_RELEASE_STATUS="default"
```

`FIRMWARE_RELEASE_STATUS` でリリースチャネルを指定します。今回は default でしたけど、 critical
にシンボリックリンクが張られているんですけどそういうもんなんでしょうか。

```bash
$ ll /lib/firmware/raspberrypi/bootloader
total 56
drwxr-xr-x 5 root root  4096  8月  9 20:59 ./
drwxr-xr-x 3 root root  4096  8月  9 20:59 ../
drwxr-xr-x 2 root root  4096  8月  9 20:59 beta/
drwxr-xr-x 2 root root  4096  8月  9 20:59 critical/
lrwxrwxrwx 1 root root     8  3月 18  2022 default -> critical/
lrwxrwxrwx 1 root root     6  3月 18  2022 latest -> stable/
-rw-r--r-- 1 root root 34767  3月 16  2022 release-notes.md
drwxr-xr-x 2 root root  4096  8月  9 20:59 stable/
```

とりいそぎ `FIRMWARE_RELEASE_STATUS` の値を stable に変更します。

```bash
$ sudo cp /etc/default/rpi-eeprom-update /etc/default/rpi-eeprom-update.20220922
$ sudo vim /etc/default/rpi-eeprom-update
```

```diff:rpi-eeprom-update
--- /etc/default/rpi-eeprom-update      2022-09-24 15:40:08.955505408 +0900
+++ /etc/default/rpi-eeprom-update.20220922     2022-09-24 15:39:52.643492273 +0900
@@ -1,2 +1,2 @@
-FIRMWARE_RELEASE_STATUS="stable"
+FIRMWARE_RELEASE_STATUS="default"
 BOOTFS=/boot/firmware
```

`/lib/firmware/raspberrypi/bootloader/stable/`
配下にある一番最新の(最後の日付の)バイナリを指定してアップデートします。

その後に再起動します。再起動後にバージョンが更新されたことを確認します。

```bash
$ sudo rpi-eeprom-update -d -f /lib/firmware/raspberrypi/bootloader/stable/pieeprom-2022-03-10.bin
$ sudo reboot

# 再起動後
$ vcgencmd bootloader_version
```

### SSD に OS イメージを書き込む

一旦シャットダウンし、ケースに SSD を設定して起動します。

`lsblk` で SSD を確認します。今回は `/dev/sda` にありました。

<https://ubuntu.com/download/raspberry-pi> から Raspberry Pi 用 Ubuntu Server の OS
イメージをダウンロードしてきます。

```bash
$ wget https://cdimage.ubuntu.com/releases/22.04.1/release/ubuntu-22.04.1-preinstalled-server-arm64+raspi.img.xz
```

OS イメージを SSD に書き込みます。

```bash
$ xzcat ubuntu-22.04.1-preinstalled-server-arm64+raspi.img.xz | sudo dd bs=4M of=/dev/sda
```

書き込んだら、起動時の Wi-Fi 接続とかの為に cloud-init の設定を書き換える必要があります。

適当なところに mount します。後は[このまえ](/articles/20210503-raspberry-pi)のように cloud-init
の設定を書き換えます。

```bash
$ sudo mkdir -p /mnt/ssd
$ sudo mount /dev/sda1 /mnt/ssd
$ cd /mnt/ssd
```

終わったら umount してシャットダウンします。

```bash
$ sudo umount /mnt/ssd
$ sudo shutdown now
```

### 再起動

Raspberry Pi から microSD を外して電源を入れます。

Ubuntu Server の場合[初回起動時はネットワークに接続されない](https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#3-wifi-or-ethernet)ので、よきにはからってて電源コードを引っこ抜いて再起動します。

再起動後に SSH 接続できたら成功です。

### おわり

よかったですね。

## 参考にしたドキュメント

- <https://denor.jp/raspberry-pi-4%E3%81%A7usb%E6%8E%A5%E7%B6%9Ahdd%E3%81%8B%E3%82%8964%E3%83%93%E3%83%83%E3%83%88ubuntu-20-04-1%E3%82%92%E8%B5%B7%E5%8B%95%E3%81%97%E3%81%A6%E3%81%BF%E3%81%BE%E3%81%97%E3%81%9F>
- <https://raspida.com/rpi4-ssd-usb-boot>
- <https://stackoverflow.com/questions/71804429/raspberry-pi-ssh-access-denied>
