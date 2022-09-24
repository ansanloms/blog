---
layout: layouts/Article.tsx
title: Raspberry pi 4 に Deno をインストールしました
date: 2021-08-01 00:00:00
---

## Rust のインストール

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
$ source $HOME/.cargo/env
```

## Deno のインストール

```bash
sudo apt install libfuse-dev
cargo install deno --locked
```
