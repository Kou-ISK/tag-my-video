# 0029 Tactics motion and plane contract

## Status

Accepted

## Date

2026-09-12

## Related ADRs

- Supersedes: [0028 Playlist Studio annotation contract](0028-playlist-studio-annotation-contract.md)
- Superseded by: N/A
- [0025 Playlist document presentation order](0025-playlist-document-presentation-order.md)

## Context

静止描画だけでは、動く選手や空間の説明に繰り返し位置調整が必要になる。追跡専用文書や別の再生時刻を導入すると、既存PlaylistのUndo・アングル・埋込動画・書き出しにずれが生じる。較正や背景処理にも保存場所と明示的な限界が必要である。

## Decision

PaintもDrawingObject/ItemAnnotationと既存Playlist履歴を正本とし、View/hook/gatewayの責務分離、1操作1履歴、モード切替時の映像DOM維持を継続する。DrawingObject.motionは表示時間と開始時刻からの相対キーフレームで表現し、基準解像度上の平行移動を線形補間する。静止注釈の従来動作は維持する。

追跡は別のデコーダーでローカル解析する。成功した結果は既存Undo履歴へ自動反映し、途中で追尾を失った部分結果は適用前の下書きとして確認・適用・破棄できる。対象やクリップが変われば中止し、解析開始後に変更された図形へ古い結果を上書きしない。再追跡は現在時刻より前のキーを保持する。対象の意味的識別や完全な3Dはこの契約に含めない。

較正はアングル別の4点と実寸、芝色処理はアングル別の色・閾値として注釈へ保存する。投影済み図形は通常の図形へ変換する。プリセットとプレゼン設定は端末設定としてgatewayに分離する。不正な保存値は黙って切り捨てず、読込エラーを返す。

動画出力では図形ごとのPNGと同じ位置キーを検証済みIPC契約で渡し、ソース時間上の図形合成・芝色処理を静止挿入より前に行う。これにより挿入した静止時間にも映像と図形を一緒に停止させる。音声を持たない素材には有限の無音トラックを生成する。

## Consequences

同じ図形を通常レビュー・Paint・書き出しで利用できる。静止と動きの混在でもアングル、レイヤー順、音声と停止位置を保てる。一方、クロマ処理には映像フレーム読取コストがあり、FFmpeg式にも上限を設ける。自動ピッチ較正・カメラ追従・意味的追跡・3D投影は今後の別判断とする。ユーザー向け名称はPaint、説明用の簡略表示はプレゼンとする。既存のTactics/Studio/Coach内部識別子は維持する。操作と上限の現行仕様は[Paint仕様](../tactics.md)を参照する。
