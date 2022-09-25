---
layout: layouts/Article.tsx
title: Raspberry pi に Deno をインストールしました
date: 2021-08-01 00:00:00
---

## 第三者のビルドを利用する

64 bit ARM 用のビルドが以下で配布されています。

<https://github.com/LukeChannings/deno-arm64>

32 bit ARM 上でも[一応利用できますがバグがある](https://github.com/LukeChannings/deno-arm64#what-about-32-bit-arm)とのことです。

## 自前でビルドする

### Rust のインストール

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
$ source $HOME/.cargo/env
```

### Deno のインストール

```bash
sudo apt install libfuse-dev
cargo install deno --locked
```
