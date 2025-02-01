---
createdAt: "2022-11-18T00:00:00+09:00"
---

# Raspberry Pi 上に RAID 1 構成を組みました

[このまえ](./20210504-raspberry-pi-nas-hdd.md)構築した NAS の HDD を RAID 1 構成のものに変えます。

## 用意したもの

- [Yottamaster HDD ケース FS2RU3](https://www.amazon.co.jp/gp/product/B084LFM8G7)
- [WD Blue 3.5インチ HDD 8TB WD80EAZZ](https://www.amazon.co.jp/dp/B09LH9XLB9)

購入した HDD ケースはハードウェア RAID をサポートしていますが、自前で Raspberry Pi (Ubuntu) 上にソフトウェア RAID を構成します。

## 実施内容

### Raspberry Pi に HDD を接続する

HDD ケースに HDD 入れて Raspberry Pi に繋ぎます。

`lsblk` で確認してみます。 `/dev/sdb` と `/dev/sdc` で 2 台認識しています。

```bash
$ lsblk
sdb      8:16   0   7.3T  0 disk
└─sdb1   8:17   0   7.3T  0 part
sdc      8:32   0   7.3T  0 disk
└─sdc1   8:33   0   7.3T  0 part
```

### HDD を準備する

`fdisk -l` で HDD の状況を確認します。

```bash
$ sudo fdisk -l /dev/sdb
The backup GPT table is not on the end of the device.
Disk /dev/sdb: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: USB3.0
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes
Disklabel type: gpt
Disk identifier: 73CB51C4-3EFA-4B6C-8CE8-6DC57EBBA449

Device     Start         End     Sectors  Size Type
/dev/sdb1   2048 15627976670 15627974623  7.3T Linux filesystem
```

```bash
$ sudo fdisk -l /dev/sdc
The backup GPT table is not on the end of the device.
Disk /dev/sdc: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: USB3.0
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes
Disklabel type: gpt
Disk identifier: 73CB51C4-3EFA-4B6C-8CE8-6DC57EBBA449

Device     Start         End     Sectors  Size Type
/dev/sdc1   2048 15627976670 15627974623  7.3T Linux filesystem
```

両方とも既にパーティションが切られているので初期化します。

```bash
$ sudo fdisk /dev/sdb

Welcome to fdisk (util-linux 2.37.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

The backup GPT table is not on the end of the device. This problem will be corrected by write.

Command (m for help): d

Selected partition 1
Partition 1 has been deleted.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

```bash
$ sudo fdisk /dev/sdc

Welcome to fdisk (util-linux 2.37.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

The backup GPT table is not on the end of the device. This problem will be corrected by write.

Command (m for help): d

Selected partition 1
Partition 1 has been deleted.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

確認してみます。

```bash
$ sudo fdisk -l /dev/sdb
Disk /dev/sdb: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: USB3.0
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes
Disklabel type: gpt
Disk identifier: A47EC0A5-B6B4-47D4-AB4D-CDD3A75BDEB1
```

```bash
$ sudo fdisk -l /dev/sdc
Disk /dev/sdc: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: USB3.0
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes
Disklabel type: gpt
Disk identifier: 9A7054DA-C107-4FDA-B2A4-6247D4C540C1
```

既に GPT なんで、このままいきます。

`fdisk` をつかってパーティションを作成します。

```bash
$ sudo fdisk /dev/sdb

Welcome to fdisk (util-linux 2.37.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): n
Partition number (1-128, default 1):
First sector (34-15628053134, default 2048):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-15628053134, default 15628053134):

Created a new partition 1 of type 'Linux filesystem' and of size 7.3 TiB.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.

$ sudo fdisk -l /dev/sdb
Disk /dev/sdb: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: USB3.0
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes
Disklabel type: gpt
Disk identifier: A47EC0A5-B6B4-47D4-AB4D-CDD3A75BDEB1

Device     Start         End     Sectors  Size Type
/dev/sdb1   2048 15628053134 15628051087  7.3T Linux filesystem
```

```bash
$ sudo fdisk /dev/sdc

Welcome to fdisk (util-linux 2.37.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): n
Partition number (1-128, default 1):
First sector (34-15628053134, default 2048):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-15628053134, default 15628053134):

Created a new partition 1 of type 'Linux filesystem' and of size 7.3 TiB.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.

$ sudo fdisk -l /dev/sdc
Disk /dev/sdc: 7.28 TiB, 8001563222016 bytes, 15628053168 sectors
Disk model: USB3.0
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes
Disklabel type: gpt
Disk identifier: 9A7054DA-C107-4FDA-B2A4-6247D4C540C1

Device     Start         End     Sectors  Size Type
/dev/sdc1   2048 15628053134 15628051087  7.3T Linux filesystem
```

### mdadm で RAID 1 構成

`/dev/sdb1` と `/dev/sdc1` にて RAID 1 として組みます。

RAID アレイを `/dev/md0` に割り当てます。

```bash
sudo mdadm --create /dev/md0 --level=raid1 --raid-devices=2 /dev/sdb1 /dev/sdc1
```

確認してみます。

```bash
$ sudo mdadm --detail /dev/md0
/dev/md0:
           Version : 1.2
     Creation Time : Sat Nov 19 07:21:18 2022
        Raid Level : raid1
        Array Size : 7813893440 (7.28 TiB 8.00 TB)
     Used Dev Size : 7813893440 (7.28 TiB 8.00 TB)
      Raid Devices : 2
     Total Devices : 2
       Persistence : Superblock is persistent

     Intent Bitmap : Internal

       Update Time : Sat Nov 19 07:26:26 2022
             State : clean, resyncing
    Active Devices : 2
   Working Devices : 2
    Failed Devices : 0
     Spare Devices : 0

Consistency Policy : bitmap

     Resync Status : 0% complete

              Name : raspberrypi:0  (local to host raspberrypi)
              UUID : 7726b25c:ae1b5573:5c8b07a6:b8cd3d97
            Events : 61

    Number   Major   Minor   RaidDevice State
       0       8       17        0      active sync   /dev/sdb1
       1       8       33        1      active sync   /dev/sdc1
```

```bash
$ sudo fdisk -l /dev/md0
Disk /dev/md0: 7.28 TiB, 8001426882560 bytes, 15627786880 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes
```

問題なさそうなので、 RAID 情報を保存しておきます。

```bash
$ sudo su
# mdadm --detail --scan >> /etc/mdadm/mdadm.conf
```

```bash
$ sudo cat /etc/mdadm/mdadm.conf | grep md0
ARRAY /dev/md0 metadata=1.2 name=raspberrypi:0 UUID=7726b25c:ae1b5573:5c8b07a6:b8cd3d97
```

### フォーマット

ext4 でフォーマットします。

```bash
$ sudo mkfs -t ext4 /dev/md0
mke2fs 1.46.5 (30-Dec-2021)
Creating filesystem with 1953473360 4k blocks and 244187136 inodes
Filesystem UUID: c4c32dec-facd-4ad7-bd43-527953a241d9
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

```bash
$ sudo parted -l

### 中略

Model: Linux Software RAID Array (md)
Disk /dev/md0: 8001GB
Sector size (logical/physical): 512B/512B
Partition Table: loop
Disk Flags:

Number  Start  End     Size    File system  Flags
 1      0.00B  8001GB  8001GB  ext4
```

### 再起動してみる

ここで再起動後も問題なく RAID 構成が認識するか確認してみます。

```bash
$ sudo reboot
```

再起動後に確認してみます。

```bash
$ sudo fdisk -l /dev/md0
fdisk: cannot open /dev/md0: No such file or directory

$ sudo mdadm --detail /dev/md0
mdadm: cannot open /dev/md1: No such file or directory
```

あれ…。

```bash
$ sudo parted -l

### 中略

Model: Linux Software RAID Array (md)
Disk /dev/md127: 8001GB
Sector size (logical/physical): 512B/512B
Partition Table: loop
Disk Flags:

Number  Start  End     Size    File system  Flags
 1      0.00B  8001GB  8001GB  ext4
```

何故か `/dev/md127` があります。

```bash
$ sudo fdisk -l /dev/md127
Disk /dev/md127: 7.28 TiB, 8001426882560 bytes, 15627786880 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes

$ sudo mdadm --detail /dev/md127
/dev/md127:
           Version : 1.2
     Creation Time : Sat Nov 19 07:21:18 2022
        Raid Level : raid1
        Array Size : 7813893440 (7.28 TiB 8.00 TB)
     Used Dev Size : 7813893440 (7.28 TiB 8.00 TB)
      Raid Devices : 2
     Total Devices : 2
       Persistence : Superblock is persistent

     Intent Bitmap : Internal

       Update Time : Sat Nov 19 07:40:36 2022
             State : clean, resyncing (PENDING)
    Active Devices : 2
   Working Devices : 2
    Failed Devices : 0
     Spare Devices : 0

Consistency Policy : bitmap

              Name : raspberrypi:0  (local to host raspberrypi)
              UUID : 7726b25c:ae1b5573:5c8b07a6:b8cd3d97
            Events : 226

    Number   Major   Minor   RaidDevice State
       0       8       17        0      active sync   /dev/sdb1
       1       8       33        1      active sync   /dev/sdc1
ansanloms@raspberrypi:~$
```

`/dev/md127` を確認すると想定通りの RAID 構成になっています。

念の為 `/etc/mdadm/mdadm.conf` を確認してみます。

```bash
$ sudo cat /etc/mdadm/mdadm.conf | grep md0
ARRAY /dev/md0 metadata=1.2 name=raspberrypi:0 UUID=7726b25c:ae1b5573:5c8b07a6:b8cd3d97
```

`/dev/md0` の構成になっています。

どうも initramfs 上にあるディスク情報が実際のディスク情報と異なる場合、デバイス名は md127 から降順で自動的に振られるとのことです。

なんで更新します。

```bash
$ sudo update-initramfs -u
```

再起動します。

```bash
$ sudo reboot
```

再起動後に確認してみます。

```bash
$ sudo fdisk -l /dev/md0
Disk /dev/md0: 7.28 TiB, 8001426882560 bytes, 15627786880 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes

$ sudo mdadm --detail /dev/md0
/dev/md0:
           Version : 1.2
     Creation Time : Sat Nov 19 07:21:18 2022
        Raid Level : raid1
        Array Size : 7813893440 (7.28 TiB 8.00 TB)
     Used Dev Size : 7813893440 (7.28 TiB 8.00 TB)
      Raid Devices : 2
     Total Devices : 2
       Persistence : Superblock is persistent

     Intent Bitmap : Internal

       Update Time : Sat Nov 19 08:19:38 2022
             State : clean, resyncing
    Active Devices : 2
   Working Devices : 2
    Failed Devices : 0
     Spare Devices : 0

Consistency Policy : bitmap

     Resync Status : 0% complete

              Name : raspberrypi:0  (local to host raspberrypi)
              UUID : 7726b25c:ae1b5573:5c8b07a6:b8cd3d97
            Events : 393

    Number   Major   Minor   RaidDevice State
       0       8       17        0      active sync   /dev/sdb1
       1       8       33        1      active sync   /dev/sdc1
```

うまくいきました。

### マウントする

`/dev/md0` を `/mnt/media` にマウントします。

```bash
$ sudo mkdir -p /mnt/media

$ sudo mount -t ext4 /dev/md0 /mnt/media

$ df -h | grep md0
/dev/md0        7.3T   28K  6.9T   1% /mnt/media

$ ll /mnt/media
total 24
drwxr-xr-x 3 root root  4096 Nov 19 13:28 ./
drwxr-xr-x 3 root root  4096 Nov 19 13:36 ../
drwx------ 2 root root 16384 Nov 19 13:28 lost+found/
```

所有者が root になっているので、自分のユーザに変えます。あわせて実際にファイルが設置できるか確認してみます。

```bash
$ sudo chown -R ansanloms:ansanloms /mnt/media

$ touch /mnt/media/test.txt

$ ll /mnt/media
total 24
drwxr-xr-x 3 ansanloms ansanloms  4096 Nov 19 13:38 ./
drwxr-xr-x 3 root      root       4096 Nov 19 13:36 ../
drwx------ 2 ansanloms ansanloms 16384 Nov 19 13:28 lost+found/
-rw-rw-r-- 1 ansanloms ansanloms     0 Nov 19 13:38 test.txt
```

`fstab` に記述します。

```bash
$ sudo vim /etc/fstab
```

```conf
# media
/dev/md0     /mnt/media    ext4    defaults    0   0
```

`fstab` の設定をもってマウントされるか確認します。

```bash
$ sudo umount /mnt/media

$ df -h | grep media

$ sudo mount -a

$ df -h | grep media
/dev/md0        7.3T   28K  6.9T   1% /mnt/media

$ ll /mnt/media
total 24
drwxr-xr-x 3 ansanloms ansanloms  4096 Nov 19 13:38 ./
drwxr-xr-x 3 root      root       4096 Nov 19 13:36 ../
drwx------ 2 ansanloms ansanloms 16384 Nov 19 13:28 lost+found/
-rw-rw-r-- 1 ansanloms ansanloms     0 Nov 19 13:38 test.txt
```

再起動後にも自動的にマウントされるか確認します。

```bash
$ sudo reboot
```

```bash
$ ll /mnt/media
total 24
drwxr-xr-x 3 ansanloms ansanloms  4096 Nov 19 13:38 ./
drwxr-xr-x 3 root      root       4096 Nov 19 13:36 ../
drwx------ 2 ansanloms ansanloms 16384 Nov 19 13:28 lost+found/
-rw-rw-r-- 1 ansanloms ansanloms     0 Nov 19 13:38 test.txt
```

### データ移行

移行元の HDD を繋ぎます。

`lsblk` で確認すると `/dev/sdd1` にありました。

マウントします。

```bash
$ sudo mkdir -p /mnt/old_media
$ sudo mount -t ext4 /dev/sdd1 /mnt/old_media
```

```bash
$ nohup rsync -av /mnt/old_media/. /mnt/media/. &
```
