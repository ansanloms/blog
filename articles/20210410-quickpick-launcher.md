---
title: ctrlp-launcher をもとに quickpick-launcher.vim をつくりました
postDate: "2021-04-10T00:00:00+09:00"
---

[CtrlP](https://github.com/ctrlpvim/ctrlp.vim)
という便利な[ファジーファインダー系プラグイン](https://zenn.dev/yutakatay/articles/vim-fuzzy-finder#2.-ctrlp.vim)があります。

この CtrlP を用いた [ctrlp-launcher](https://github.com/mattn/ctrlp-launcher)
という激烈便利なランチャがあります。ずっとおせわになっております。

- [CtrlP にランチャ拡張書いたら捗りすぎて生きているのが辛い](https://mattn.kaoriya.net/software/vim/20120427205409.htm)

最近 CtrlP から [quickpick.vim](https://github.com/prabirshrestha/quickpick.vim)
という便利な FF プラグインに移行したりしています。

なので quickpick.vim 上で ctrlp-launcher と同じようなことができるプラグインをつくろうとおもいました。

## quickpick-launcher.vim

できたのが
[quickpick-launcher.vim](https://github.com/ansanloms/quickpick-launcher.vim)
になります。

`~/.quickpick-launcher` に ctrlp-launcher と同じようにコマンドを定義し `:PLauncher`
を実行して当該コマンドを実行できます。

ctrlp-launcher と同様にファイル分割もできます。 `~/.quickpick-launcher-hoge` みたいなファイルを用意した場合
`:PLauncher hoge` で対象ファイル上のコマンドを選択できます。

## quickpick-launcher-selector.vim

分割したコマンド定義ファイルを quickpick.vim で選択できるプラグイン
[quickpick-launcher-selector.vim](https://github.com/ansanloms/quickpick-launcher-selector.vim)
もつくりました。

例えば `~/.quickpick-launcher` / `~/.quickpick-launcher-fuga` /
`~/.quickpick-launcher-hoge` とファイルを用意して `:PLauncherSelector` を実行すると
quickpick.vim 上で `(none)` / `fuga` / `hoge` と表示されます。

じぶんはよくおしごとのプロジェクト毎にコマンド定義ファイルを用意してそこに開発および本番サーバへの ssh のコマンドとか書いたりしています。

## おわり

quickpick.vim の拡張の開発はとっても簡単でした。ほかにもいろいろつくれればいいなとかおもったりしました。
