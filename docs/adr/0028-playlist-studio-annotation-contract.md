# 0028 Playlist Studio annotation contract

## Status

Accepted

## Date

2026-09-10

## Related ADRs

- Supersedes: N/A
- Superseded by: N/A
- [0025 Playlist document presentation order](0025-playlist-document-presentation-order.md)
- [0027 Enforced design system foundation](0027-enforced-design-system-foundation.md)

## Context

Playlistにリッチな描画編集を加える際、編集専用の保存形式を増やすと通常レビュー・Undo・動画書き出しとの不一致が生じる。従来のPNG出力は編集とは別実装で、異なる時刻の描画を1枚へ混在させていた。

## Decision

Studioも既存DrawingObject/ItemAnnotationを正本とする。追加図形と任意のopacity/dashed属性は既存注釈へ追加し、アングル・描画時刻・基準解像度を維持する。1ジェスチャーは完了時に1つの履歴変更として反映し、中断またはクリップ切替時の下書きは保存しない。

描画ツール・プロパティ・レイヤーはprops-only View、pointer操作は専用hook、Playlist履歴・再生への接続はadapter hookが担当する。モード・選択・ツールはwindow-only。映像DOMはモード切替時も維持する。

表示とPNGは同じrendererを使用する。動画出力契約に時刻別freezeFramesを追加し、Electronで検証後、挿入済み静止時間を累積して映像と音声、アングル別オーバーレイを同じ時刻へ配置する。既存の単一freeze入力も受け付ける。

## Consequences

通常描画とStudioは同じ保存・履歴を利用できる。複数場面の描画が最初の静止画に混ざらない。図形ごとの基準解像度を使うため、ウィンドウ寸法と出力解像度が異なっても配置を維持する。自動追跡・3D・キーフレームアニメーションは別のモデル判断が必要であり、今回の手動2D編集には含めない。
