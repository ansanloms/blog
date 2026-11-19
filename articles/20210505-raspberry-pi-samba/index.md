---
createdAt: "2021-05-05T01:00:00+09:00"
updatedAt: "2026-11-17T00:00:00+09:00"
---

# Raspberry Pi 4 に NAS を構築しました(Samba の設定)

[このまえ](../20210504-raspberry-pi-nas-hdd/index.md)のつづきです。

## 更新履歴

- 2026-11-17: Raspberry Pi 5 (Ubuntu Server 24.04) で組み直したので、[NFS で公開する手順](#nfs-で公開する)を追記しました。

## 実施内容

### HDD のマウントまで

[このまえの記事](../20210504-raspberry-pi-nas-hdd/index.md)を見てください。

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

### Samba のユーザを作成する

`force user` で指定した通りに Samba のユーザを作成します。 これは Linux のユーザではないですが、関連するので先に Linux ユーザが必要です。

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

Ubuntu Server 24.04 では `apt install samba` の時点で smbd が起動していました。

### Windows からアクセスしてみる

エクスプローラから `\\192.168.xx.xx\media` にアクセスします。

資格情報の入力を求められるので Samba で作成したユーザ情報を入力します。

問題なく閲覧、更新できたら成功です。よかったですね。

## NFS で公開する

別の Linux サーバ (Arch Linux) からは NFS でマウントします。そのサーバでは Docker のコンテナから NAS のファイルを読み書きします。NFS ならファイルの所有者 (uid と gid) がそのまま見えるので、コンテナからも扱いやすいです。両方のサーバでユーザの uid を揃えておきます (今回はどちらも 1000)。

Windows からは引き続き Samba でアクセスします。同じ `/mnt/media` を Samba と NFS の両方で公開します。

### サーバ側 (Raspberry Pi)

NFS サーバをインストールします。

```bash
sudo apt install nfs-kernel-server
```

`/etc/exports` に公開するディレクトリを追記します。公開先はクライアントの IP アドレスだけに絞ります。

```bash
sudo vim /etc/exports
```

```conf
/mnt/media 192.168.yy.yy(rw,sync,no_subtree_check)
```

- `rw` : 読み書きを許可します。
- `sync` : 変更がディスクに書き込まれてから応答します。既定値です。
- `no_subtree_check` : サブツリーのチェックを無効にします。

反映して確認します。

```bash
$ sudo exportfs -a

$ sudo exportfs -v
/mnt/media    	192.168.yy.yy(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)
```

`root_squash` が既定で付きます。クライアントの root は匿名ユーザとして扱われるので、NAS に書き込むコンテナは `user: "1000:1000"` のように一般ユーザで動かします。

### クライアント側 (Arch Linux)

NFS のクライアントをインストールし、マウント先を作ります。

```bash
sudo pacman -S nfs-utils
sudo mkdir -p /mnt/media
```

`/etc/fstab` に追記します。

```bash
sudo vim /etc/fstab
```

```conf
192.168.xx.xx:/mnt/media  /mnt/media  nfs  rw,nofail,x-systemd.automount,x-systemd.mount-timeout=30  0 0
```

- `x-systemd.automount` : 最初にアクセスしたときにマウントします。
- `nofail` : NAS が落ちていてもクライアントの起動を止めません。
- `x-systemd.mount-timeout=30` : マウントの完了を待つ秒数です。

NFS のバージョンは指定していません。指定しない場合、クライアントは 4.2 から順に下げて、サーバが対応するバージョンを探します。

反映して確認します。

```bash
$ sudo systemctl daemon-reload
$ sudo systemctl restart remote-fs.target

$ ls /mnt/media

$ findmnt /mnt/media
TARGET     SOURCE                  FSTYPE OPTIONS
/mnt/media systemd-1               autofs rw,relatime,fd=89,pgrp=1,timeout=0,minproto=5,maxproto=5,direct,pipe_ino=1086051
/mnt/media 192.168.xx.xx:/mnt/media nfs4   rw,relatime,vers=4.2,rsize=1048576,wsize=1048576,namlen=255,hard,fatal_neterrors=none,proto=tcp,timeo=600,retrans=2,sec=sys,clientaddr=192.168.yy.yy,local_lock=none,addr=192.168.xx.xx
```

NFS 4.2 でマウントできました。`touch` でファイルを作り、所有者が自分のユーザになっていれば完了です。

## おわり

たのしかったです。
