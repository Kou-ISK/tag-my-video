# 0026 Package session window ownership

## Status

Accepted

## Date

2026-08-30

## Related ADRs

- Supersedes: N/A
- Superseded by: N/A

## Context

Main process が単一の Main Window 参照を持つ構造では、複数の `.stpkg` を開いたときに Timeline、Analysis、Coding Panel、Playlist の宛先が最後に作成したWindowへ上書きされる。Finder/Explorerからのopen要求も、Setup画面がmountされていることに依存し、読み込み中の複数要求を保持できなかった。

## Decision

- `PackageSessionRegistry` を正本とし、Main Window、canonical package path、補助Windowを1つのPackage Sessionとして管理する。
- package固有の補助WindowとIPCはsenderからSessionを解決し、同じSessionのMain Windowだけへ送信する。
- OS由来のdocument openはFIFOキューで処理し、同じcanonical pathの既存Sessionは復元・focusする。未使用の空Sessionは再利用し、それ以外は新しいMain Windowを作る。
- package pathはRendererのロード開始時にbindし、ロード失敗時はreservationを解放する。

## Consequences

- 異なるpackageの再生、Timeline、Analysis、Coding Panel、Playlist通信が混線しない。
- `.stpkg` を複数回openしても同じpackageの重複Sessionを作らない。
- Settings、Help、Export Progressのようなapplication-global windowはSession所有にしない。
- Session固有のWindowやIPCを追加する場合はRegistryへ所有関係を登録し、グローバルな「最後のMain Window」参照へ戻さない。
