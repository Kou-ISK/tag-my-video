# このアプリについて

### 概要

- スポーツのビデオ分析での利用を想定
- ボタン操作を通じて映像にイベントをタグ付けするアプリ
- 2つの映像ファイルを同時に再生することが可能
  - ボタン1回目押下時、2回目押下時の映像の秒数を取得し、タイムライン配列に格納する。
  - 保存ボタンを押すことでタイムラインはJSONファイルに保存される

### ホットキー

- 上キー: 再生/停止
- 右キー: 0.5倍速再生
- ⇧ + 右キー: 2倍速再生
- ⌘ + 右キー: 4倍速再生
- ⌥ + 右キー: 6倍速再生
- 左キー: 5秒戻し
- ⇧ + 左キー: 10秒戻し
- ⌘ + ⇧ + A: グラフを表示

## ターミナ操作手順

### ターミナルから起動する方法

以下コマンドをターミナルで実行

```zsh
yarn init
yarn electron:start
```

### アプリを配布可能な形式にビルドする手順

以下コマンドを実行することでdist配下にdmgファイルが配置される。

```zsh
yarn electron:build
```
