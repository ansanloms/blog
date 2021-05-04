---
title: Raspberry Pi 4 に NAS を構築しました(HDD の準備)
date: 2021-05-04T00:00+09:00
---

[先日セットアップした Raspberry Pi 4](/articles/20210503-raspberry-pi) で NAS をやっていきます。

## 用意したもの

- Raspberry Pi 4

[先日セットアップした Raspberry Pi 4](/articles/20210503-raspberry-pi) です。

- HDD

おうちにころがっていた [I-O DATA HDCZ-UT8KC](https://www.iodata.jp/product/hdd/hdd/hdcz-utc/) をつかいます。

容量は 8 TB です。

## 実施内容

Raspberry Pi に HDD をつないで マウントして Samba をいれます。

<p style="color: red;">以降の手順で HDD 内の全データが消えます。</p>

### Raspberry Pi に HDD を接続する

起動中の Raspberry Pi に HDD をつないで `lsblk` で HDD を確認します。

```
$ lsblk
NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
--- 中略
sda           8:0    0  7.3T  0 disk
└─sda1        8:1    0    2T  0 part
```

ありました。

`fdisk -l` で HDD の状況を確認します。

```
$ sudo fdisk -l /dev/sda
Disk /dev/sda: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: HDCZ-UT
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: dos
Disk identifier: 0x76024314

Device     Boot Start        End    Sectors Size Id Type
/dev/sda1        2048 4294967295 4294965248   2T  b W95 FAT32

```

既にパーティションが存在するのでこれを削除してつくりなおします。

あと `Disklabel type: dos` となっているので [MBR](https://ja.wikipedia.org/wiki/%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%96%E3%83%BC%E3%83%88%E3%83%AC%E3%82%B3%E3%83%BC%E3%83%89) です。 MBR だと 2 TB 以上のパーティションを作成できないので [GPT](https://ja.wikipedia.org/wiki/GUID%E3%83%91%E3%83%BC%E3%83%86%E3%82%A3%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB) に変えます。

### 既に存在するパーティションを削除

先ずはパーティションを削除します。

```
$ sudo fdisk /dev/sda

Welcome to fdisk (util-linux 2.34).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

The size of this disk is 7.3 TiB (8001563222016 bytes). DOS partition table format cannot be used on drives for volumes larger than 2199023255040 bytes for 512-byte sectors. Use GU
ID partition table format (GPT).

Command (m for help): d  <--- 1

Selected partition 1
Partition 1 has been deleted.

Command (m for help): w  <--- 2
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

1. パーティションを削除します。パーティションが複数存在する場合はこの後にどのパーティションを削除するか尋ねられます。今回は 1 つしかパーティションがなかったのでそのまま削除されました。
2. 変更を保存して終了します。

確認してみます。

```
$ sudo fdisk -l /dev/sda
Disk /dev/sda: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: HDCZ-UT
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: dos
Disk identifier: 0x76024314
```

消えました。

### GPT にする

`parted` をつかって GPT にします。

```
$ sudo parted /dev/sda
GNU Parted 3.3
Using /dev/sda
Welcome to GNU Parted! Type 'help' to view a list of commands.
(parted) print          <--- 1
Model: I-O DATA HDCZ-UT (scsi)
Disk /dev/sda: 8002GB
Sector size (logical/physical): 512B/4096B
Partition Table: msdos
Disk Flags:

Number  Start  End  Size  Type  File system  Flags

(parted) mklabel gpt    <--- 2
Warning: The existing disk label on /dev/sda will be destroyed and all data on this disk will be lost. Do you want to continue?
Yes/No? y
(parted) print          <--- 3
Model: I-O DATA HDCZ-UT (scsi)
Disk /dev/sda: 8002GB
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags:

Number  Start  End  Size  File system  Name  Flags

(parted) quit           <--- 4
Information: You may need to update /etc/fstab.
```

1. `print` で念の為現行のディスク情報を確認します。 `Partition Table: msdos` となっているので MBR です。
2. `mklabel gpt` で GPT に変更します。 **ディスク上の全データが削除される** 旨が確認されるので問題なければ `y` とします。すぐおわります。
3. 再度 `print` でディスク情報を確認します。 `Partition Table: gpt` となっているので GPT です。
4. `quit` で終了します。

fdisk でも確認してみます。

```
$ sudo fdisk -l /dev/sda
Disk /dev/sda: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: HDCZ-UT
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: 5647BD4F-A277-459D-9F06-741C66266ACC
```

`Disklabel type: gpt` になっています。

### パーティションを作成

今回は `fdisk` をつかってパーティションを作成します。

```
$ sudo fdisk /dev/sda

Welcome to fdisk (util-linux 2.34).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): n   <--- 1
Partition number (1-128, default 1):            <--- 2
First sector (34-15628053134, default 2048):    <--- 3
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-15628053134, default 15628053134):    <--- 4

Created a new partition 1 of type 'Linux filesystem' and of size 7.3 TiB.

Command (m for help): w   <--- 5
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

1. `n` でパーティションを作成します。
2. パーティション番号を指定します。デフォルトの `1` でいいのでそのまあ Enter を押下します。
3. 開始位置セクタを指定します。特になにもなければデフォルトでいきます。
4. 終了位置セクタを指定します。今回は HDD に 1 こしかパーティションきらないつもりなのでそのままデフォルトでいきます。
5. 保存して終了します。

確認してみます。

```
$ sudo fdisk -l /dev/sda
Disk /dev/sda: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: HDCZ-UT
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: 5647BD4F-A277-459D-9F06-741C66266ACC

Device     Start         End     Sectors  Size Type
/dev/sda1   2048 15628053134 15628051087  7.3T Linux filesystem
```

パーティション `sda1` ができています。

### パーティションのフォーマット

作成したパーティションをフォーマットします。ファイルタイプは Ubuntu の標準である `ext4` にしようと思います。

1 分くらいでおわります。

```
$ sudo mkfs -t ext4 /dev/sda1
mke2fs 1.45.5 (07-Jan-2020)
Creating filesystem with 1953506385 4k blocks and 244191232 inodes
Filesystem UUID: e89e3a74-2a73-4ac3-8e36-6a306b3f57ec
Superblock backups stored on blocks:
        32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208,
        4096000, 7962624, 11239424, 20480000, 23887872, 71663616, 78675968,
        102400000, 214990848, 512000000, 550731776, 644972544, 1934917632

Allocating group tables: done
Writing inode tables: done
Creating journal (262144 blocks): done
Writing superblocks and filesystem accounting information: done
```

確認してみます。

```
$ sudo parted -l
Model: I-O DATA HDCZ-UT (scsi)
Disk /dev/sda: 8002GB
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name  Flags
 1      1049kB  8002GB  8002GB  ext4
```

`ext4` になっています。

### マウントする

今回は `/mnt/media` にマウントしようと思います。

```
sudo mkdir -p /mnt/media
sudo mount -t ext4 /dev/sda1 /mnt/media
```

確認してみます。

```
$ df -h | grep sda1
/dev/sda1       7.3T   93M  6.9T   1% /mnt/media
```

マウントされました。マウント先を確認してみます。

```
$ ll /mnt/media
total 24
drwxr-xr-x 3 root root  4096 May  4 21:01 ./
drwxr-xr-x 3 root root  4096 May  4 21:11 ../
drwx------ 2 root root 16384 May  4 21:01 lost+found/
```

所有者が `root` になっているので、自分のユーザに変えます。

```
sudo chown -R ansanloms:ansanloms /mnt/media
```

実際にファイルが設置できるか確認してみます。

```
$ touch /mnt/media/test.txt
ansanloms@ubuntu:~$ ll /mnt/media
total 24
drwxr-xr-x 3 ansanloms ansanloms  4096 May  4 21:14 ./
drwxr-xr-x 3 root      root       4096 May  4 21:11 ../
drwx------ 2 ansanloms ansanloms 16384 May  4 21:01 lost+found/
-rw-rw-r-- 1 ansanloms ansanloms     0 May  4 21:14 test.txt
```

できました。

### fstab に記述する

このままだと再起動するとアンマウントされるので、起動時もマウントされるように `/etc/fstab` に追記します。

```
$ sudo cp -p /etc/fstab /etc/fstab.20210504
$ sudo vim /etc/fstab
```

```:/etc/fstab
# media
/dev/sda1     /mnt/media    ext4    defaults    0   0
```

fstab の設定でちゃんとマウントされるか確認する為に、一旦アンマウントします。

```
sudo umount /mnt/media
```

アンマウントされたことを確認します。

```
df -h | grep media
```

`mount -a` で fstab の内容からもマウントされます。

```
$ sudo mount -a
$ df -h | grep media
/dev/sda1       7.3T   93M  6.9T   1% /mnt/media
```

問題なさそうです。

再起動してみます。

```
sudo reboot
```

```
$ df -h | grep media
/dev/sda1       7.3T   93M  6.9T   1% /mnt/media
```

再起動後もちゃんとマウントされていました。よかったですね。

## ここまで

次回は samba のセットアップをしたいと思います。
