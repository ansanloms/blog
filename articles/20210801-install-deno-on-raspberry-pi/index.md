---
createdAt: "2021-08-01T00:00:00+09:00"
---

# Raspberry pi に Deno をインストールしました

## 第三者のビルドを利用する

64 bit ARM 用のビルドが以下で配布されています。

<https://github.com/LukeChannings/deno-arm64>

32 bit ARM 上でも[一応利用できますがバグがある](https://github.com/LukeChannings/deno-arm64#what-about-32-bit-arm)とのことです。

## 自前でビルドする

### Rust のインストール

<https://www.rust-lang.org/learn/get-started>

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Deno のインストール

```bash
sudo apt install build-essential libfuse-dev
cargo install deno --locked
```
