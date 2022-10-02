---
title: Raspberry Pi 4 に NAS を構築しました(Samba の設定)
postDate: 2021-05-05T01:00:00+09:00"
---

[このまえ](/articles/20210504-raspberry-pi-nas-hdd)のつづきです。

## 実施内容

### HDD のマウントまで

[このまえの記事](/articles/20210504-raspberry-pi-nas-hdd)を見てください。

### Samba のインストール

```bash
sudo apt install samba
```

### Samba の設定ファイルを更新する

```bash
sudo cp -p /etc/samba/smb.conf /etc/samba/smb.conf.20210504
sudo vim /etc/samba/smb.conf
```

ファイル末尾にこのように追記しました。

```ini:smb.conf
[media]
comment = nas
path = /mnt/media
public = no
read only = no
browsable = no
force user = ansanloms
```

- `path` : Samba の対象パスを記述します。
- `public` : ゲストアカウントでのログイン可不可を指定します。今回は不可にします。
- `read only` : 読み取り専用にするかです。今回は no にします。
- `browseable` : ネットワーク上で他の端末から検索できるかを指定します。今回は no にします。
- `force user` : アクセス可能な Samba ユーザを指定します。

### Samba のユーザを作成する。

`force user` で指定した通りに Samba のユーザを作成します。 これは Linux のユーザではないですが、関連するので先に Linux
ユーザが必要です。

`pdbedit --create` でやっていきます。

```bash
$ sudo pdbedit --create ansanloms
new password:
retype new password:
```

作成されたか確認します。

```bash
$ sudo pdbedit --list | grep ansanloms
ansanloms:1000:Ubuntu
```

できました。

### Samba を起動する

起動します。

```bash
sudo systemctl start smbd
```

確認してみます。

```bash
$ ps aux | grep smbd
root        3421  0.5  0.2  58264 20848 ?        Ss   22:18   0:00 /usr/sbin/smbd --foreground --no-process-group
root        3423  0.0  0.0  55848  6160 ?        S    22:18   0:00 /usr/sbin/smbd --foreground --no-process-group
root        3424  0.0  0.0  55848  4700 ?        S    22:18   0:00 /usr/sbin/smbd --foreground --no-process-group
root        3425  0.0  0.1  58264 11872 ?        S    22:18   0:00 /usr/sbin/smbd --foreground --no-process-group
ansanlo+    3428  0.0  0.0   8724   640 pts/0    S+   22:18   0:00 grep --color=auto smbd
```

起動しているようです。

### Windows からアクセスしてみる

エクスプローラから `\\192.168.xx.xx\media` にアクセスします。

資格情報の入力を求められるので Samba で作成したユーザ情報を入力します。

問題なく閲覧、更新できたら成功です。よかったですね。

## おわり

たのしかったです。
