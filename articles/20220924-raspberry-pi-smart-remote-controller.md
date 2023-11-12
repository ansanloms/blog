---
title: Raspberry Pi Zero WH でスマートリモコン的なものをつくりました
postDate: "2022-09-24T00:00:00+09:00"
---

Raspberry Pi Zero WH を手に入れました。ちょっと前に Google Home も買ったのでスマートリモコン的なことをしようとおもいました。

電子工作なんて工業高校でやった PIC マイコン以来です。なにもかもわすれています。

## Raspberry Pi Zero WH の準備

いつもどおり Raspberry Pi Imager で microSD に書き込みます。 OS は Raspberry Pi OS Lite (32 bit) にしました。

Wi-Fi と SSH を使いたいので、書き込む際に右下の歯車から以下の通り詳細設定をします。

- 「SSH を有効にする」にチェック。
  - 「公開鍵認証のみを許可する」を選択し、 authorized_keys を入力。
- 「ユーザ名とパスワードを設定する」にチェック。
  - 任意のユーザ名およびパスワードを入力。
- 「Wi-Fi を設定する」にチェック。
  - SSID やパスワード等をよしなに入力。

尚 Raspberry Pi Zero WH についている無線 LAN は 2.4 GHz 帯のみ対応しています。これを忘れて 5 GHz 帯の SSID を登録して数時間溶かしました。

準備できたらとりあえず諸々最新にしておきます。

```bash
sudo apt update
sudo apt upgrade
```

## pigpio のインストール

<https://abyz.me.uk/rpi/pigpio/>

pigpio は Raspberry Pi の GPIO (汎用入出力)にアクセスする為のライブラリです。

```bash
sudo apt install pigpio
```

pigpio デーモンも起動しておく必要があるので systemctl で登録しておきます。

```bash
sudo systemctl enable pigpiod
sudo systemctl start pigpiod
```

起動しているか確認します。

```bash
sudo systemctl status pigpiod
```

併せて、 pigpio の作者による赤外線送受信の為のプログラム [IR Record and Playback](http://abyz.me.uk/rpi/pigpio/examples.html#Python_irrp_py) も入手しておきます。

```bash
sudo apt install python3-pigpio
curl http://abyz.me.uk/rpi/pigpio/code/irrp_py.zip | zcat > irrp.py
```

## リモコンの赤外線を送受信してみる

<https://www.raspberrypi.com/documentation/computers/os.html#gpio-and-the-40-pin-header>

今回は GPIO 22 で赤外線の送信を、 GPIO 23 で赤外線を受信します。

以下の通りに設定します。設定内容の詳細は <http://abyz.me.uk/rpi/pigpio/pigs.html> にあります。

```bash
# GPIO 22 を出力(書込)モードに
echo "m 22 w" > /dev/pigpio

# GPIO 22 の出力レベルを 0 に
echo "w 22 0" > /dev/pigpio

# GPIO 23 を入力(読込)モードに
echo "m 23 r" > /dev/pigpio

# GPIO 23 をプルアップに
echo "pud 22 u" > /dev/pigpio
```

### 赤外線の受信

[赤外線リモコン受信モジュール](https://akizukidenshi.com/catalog/g/gI-04659/)を用います。

|        | 位置 | 接続先  | 物理番号 |
| :----- | :--- | :------ | :------- |
| OUTPUT | 左   | GPIO 23 | 16       |
| GROUND | 中央 | GROUND  | 6        |
| VCC    | 右   | 3.3 V   | 1        |

以下の通り実行して受信した赤外線を記録します。各オプションの詳細は `irrp.py` 先頭のコメントにあります。

```bash
python3 ./irrp.py --record --gpio 23 --post 130 --file codes.json test
```

受信待機状態になります。

```txt
Recording
Press key for 'test'
```

そうしたら赤外線リモコン受信モジュールに向けて登録したいリモコン操作します。問題なく受信できれば `Okay` と表示されるはずです。

確認の為再度受信待機状態になるので、再度リモコン操作します。問題なければ再度 `Okay` と表示されるはずです。因みに確認をスキップしたい場合は `--no-confirm` オプションを付与します。

```txt
Press key for 'test' to confirm
Okay
```

`codes.json` に受信した信号データが入っているはずです。

```json:codes.json
{"test": [1956, 1019, 5432, 1019, 1457, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 1457, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 1457, 531, 1457, 531, 488, 531, 1457, 531, 1457, 531, 1457, 531, 1457, 531, 488, 531, 488, 11215, 1956, 1019, 5432, 1019, 1457, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 1457, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 1457, 531, 1457, 531, 488, 531, 1457, 531, 1457, 531, 1457, 531, 1457, 531, 488, 531, 488, 11215, 1956, 1019, 5432, 1019, 1457, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 1457, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 488, 531, 1457, 531, 1457, 531, 488, 531, 1457, 531, 1457, 531, 1457, 531, 1457, 531, 488, 531, 488]}
```

### 赤外線の送信

[こちら](https://vintagechips.wordpress.com/2013/10/05/%E8%B5%A4%E5%A4%96%E7%B7%9Aled%E3%83%89%E3%83%A9%E3%82%A4%E3%83%96%E5%9B%9E%E8%B7%AF%E3%81%AE%E6%B1%BA%E5%AE%9A%E7%89%88/)を参考に回路を組みます。今回は 赤外線 LED を 2 つにしました。

以下の通り実行すると信号データを送信します。

```bash
python3 ./irrp.py --play --gpio 22 --file codes.json test
```

### 長い信号データの送信

エアコンの冷房の信号データを送信してみたら以下のようなエラーになりました。

```bash
$ python3 irrp.py --play --gpio 22 --file codes.json cooling
Traceback (most recent call last):
  File "/home/ansanloms/irrp.py", line 481, in <module>
    pi.wave_chain(wave)
  File "/usr/lib/python3/dist-packages/pigpio.py", line 2609, in wave_chain
    return _u2i(_pigpio_command_ext(
  File "/usr/lib/python3/dist-packages/pigpio.py", line 1011, in _u2i
    raise error(error_text(v))
pigpio.error: 'chain is too long'
```

`pigpio.error: 'chain is too long'` は、[送信する信号データが長すぎる(600 エントリ以上)](http://abyz.me.uk/rpi/pigpio/python.html)際のエラーのようです。

これを回避するには以下の方法があるようです。

- [信号データを圧縮する](https://korintje.com/archives/28)
- [信号データを分割する](http://www.neko.ne.jp/~freewing/raspberry_pi/raspberry_pi_gpio_pigpio_ir_remote_control/)

今回は信号データを圧縮する方法でやっていきます。

最初は分割案でやっていこうとしたのですが、日立のエアコンだとイマイチどこで分割するべきか図りかねたので断念しました。

## つづく

とりあえず赤外線リモコンの代替を Raspberry Pi Zero WH に載せることができました。後は外部、例えば Google Home 等からこれらを操作できればと思います。

## 参考にしたドキュメント

- <https://qiita.com/takjg/items/e6b8af53421be54b62c9>
- <https://vintagechips.wordpress.com/2013/10/05/%E8%B5%A4%E5%A4%96%E7%B7%9Aled%E3%83%89%E3%83%A9%E3%82%A4%E3%83%96%E5%9B%9E%E8%B7%AF%E3%81%AE%E6%B1%BA%E5%AE%9A%E7%89%88/>
- <https://bsblog.casareal.co.jp/archives/5010>
- <https://bsblog.casareal.co.jp/archives/5891>
- <https://korintje.com/archives/28>
- <http://www.neko.ne.jp/~freewing/raspberry_pi/raspberry_pi_gpio_pigpio_ir_remote_control/>
