---
createdAt: "2022-09-25T00:00:00+09:00"
---

# Raspberry Pi を mDNS に対応させました

Raspberry Pi の名前解決には Bonjour を利用していましたが、 Raspberry Pi 上に mDNS を設定するようにしました。

## Avahi のインストール

<http://avahi.org/>

```bash
sudo apt install avahi-daemon
```

## ホスト名の解決

Avahi には `hostname.local` という名前を使ってローカルでホスト名を解決する機能があります。

とりあえずホスト名を設定します。 `/etc/hostname` にホスト名を記述して再起動します。

```bash
$ cat /etc/hostname
raspberrypi
```

続いて `/etc/nsswitch.conf` の host 行を修正します。 `resolve` と `dns` の前に `mdns4_minimal` を追記します。が、おそらくデフォルトでそのようになっているはずです。

```bash
$ cat /etc/nsswitch.conf | grep hosts
hosts:          files mdns4_minimal [NOTFOUND=return] dns
```

## サービスの設定

SSH サービスの設定します。サンプルがあるのでそのままそれを利用します。

```bash
sudo cp /usr/share/doc/avahi-daemon/examples/ssh.service /etc/avahi/services/ssh.service
```

デーモンを再起動します。

```bash
sudo systemctl daemon-reload
sudo systemctl restart avahi-daemon
```

起動しているか確認します。

```bash
sudo systemctl status avahi-daemon
```

## おわり

これで `raspberrypi.local` で SSH できるはずです。 Samba 等もこのホスト名でいけるはずです。

## 参考にしたドキュメント

- <https://wiki.archlinux.jp/index.php/Avahi>
