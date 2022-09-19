---
title: Raspberry pi 4 に Deno をインストールしました
date: 2021-08-01T00:00+09:00
---

## Rust のインストール

```
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
$ source $HOME/.cargo/env
```

## Deno のインストール

```
sudo apt install libfuse-dev
cargo install deno --locked
```