# SporTagLytics System Overview

SporTagLytics の現行アーキテクチャ概要です。詳細規約は `AGENTS.md` を正とし、本書は実装トレース用の要約に限定します。

関連する入口:

- [ドキュメント索引](README.md)
- [ドキュメント運用ガイド](documentation-guide.md)
- [Docs Impact Matrix](documentation-guide.md#docs-impact-matrix)
- [プロジェクト構成](project-structure.md)
- [ADR](adr/README.md)
- [Testing and Quality Gates](testing.md)
- [Privacy and Data Handling](privacy-and-data-handling.md)
- [自動イベント検出](event-detection.md)

## レイヤー構成

- 依存方向: `pages -> features -> shared`
- `pages` はルーティングと feature 合成のみ担当
- `features` は `Screen / Controller(or Hook) / View / Gateway / domain` を機能単位で内包
- shared 相当は `src/components`, `src/hooks`, `src/utils`, `src/types`, `src/contexts`, `src/shared`, `src/report`
- feature 外から feature を参照する場合は `src/features/<feature>/index.ts` の公開 API のみ利用
- Electron、URL、永続化、OS file dialog などの外部依存は Gateway / Controller / Hook に閉じ込める
- Storybook 対象は描画専用 `View` と `src/components/ui`。View は `window.electronAPI` を直接使用しない
- Atomic Design はアプリ全体のフォルダ規約ではなく、shared UI 設計時のメンタルモデルとしてのみ利用
- `src/design-system/` はfoundation / semantic tokenとMUI Themeの正本、`src/components/ui/` はprops-only shared patternの配置先
- UI変更は `check:design-system` とStorybook a11y/buildで検証する

## Electron 構成

### Main process

`electron/src/main.ts` は起動と各handler/windowの組み立てに集中します。実処理はドメインごとに分割します。

代表例:

- `electron/src/ipc/fileHandlers.ts`
- `electron/src/ipc/reportHandlers.ts`
- `electron/src/ipc/dashboardHandlers.ts`
- `electron/src/ipc/codeWindowHandlers.ts`
- `electron/src/ipc/exportHandlers.ts`
- `electron/src/ipc/llamaHandlers.ts`
- `electron/src/ipc/eventDetectionHandlers.ts`

Window runtime:

- `electron/src/analysisWindow.ts`
- `electron/src/codingPanelWindow.ts`
- `electron/src/playlistWindow.ts`
- `electron/src/timelineWindow.ts`
- `electron/src/settingsWindow.ts`
- `electron/src/exportProgressWindow.ts`

Packageを扱うWindowは `electron/src/packageSessionRegistry.ts` のPackage Sessionに所属する。Main Window、Timeline、Analysis、Coding Panel、Playlistはpackage単位で所有・IPC送信先を分離する。Settings、Help、Export Progressはapplication-globalとして扱う。OSからの `.stpkg` openはMain Processのキューで処理し、既存Sessionをfocusするか、空Sessionの再利用または新規Main Windowを選ぶ。

### Preload

`electron/src/preload.ts` は用途別bridgeを合成します。Renderer は `window.electronAPI` のみ使用し、`electron` / `ipcRenderer` を直接 import しません。

### Typed IPC

IPC contract の正本は `src/types/ipc/` です。Main process は sender window と payload を検証し、preload も inbound payload を guard します。

## BrowserWindow セキュリティ

全 BrowserWindow で以下を適用します。

- `contextIsolation: true`
- `sandbox: true`
- `nodeIntegration: false`
- `webSecurity: true`
- `window.open` を拒否
- 許可されないnavigationを拒否

外部binaryはrendererから直接起動せず、main process配下のmanager/runner境界で管理します。

## パッケージ / 映像モデル

`.metadata/config.json` の `angles[] -> clips[]` を現行の映像構成正本とします。

- 最大8アングル
- 各アングル最大16クリップ
- local / YouTube source
- 各clipに `timelineStartSeconds`
- optional `durationSeconds`
- アングル単位の同期補正は `syncData.angleOffsets[]`

ローカル映像は元クリップを仮想timeline上で切り替えます。クリップ間空白は再生時に黒画面・無音で扱い、書き出し時だけ必要な一時合成を行います。

旧 `tightViewPath` / `wideViewPath` だけのpackageはロード時migrationで現行 `angles[].clips[]` へ吸収します。

## Playback authority と分離Timeline

Video.js player、再生時計、Timeline document、Undo/Redo履歴はメイン動画windowを唯一のauthorityとします。

TimelineはPackage Sessionごとに1つの専用BrowserWindowです。

- packageを開いた時に自動表示
- 閉じた後は `ウィンドウ > タイムラインを表示` で再表示
- document/selection sync、高頻度clock sync、編集commandを別payloadにする
- Timeline window側のhotkey commandもmain video runtimeへ戻す

関連ADR: [0021 Detached Timeline and Playback Authority](adr/0021-detached-timeline-playback-authority.md)

## Timeline model

`timeline.json` の現行formatはversion 2です。

```text
TimelineDocument
├ rows[]
└ instances[]
```

- 行が名称・色・表示順を所有
- `TimelineData` は `actionName / startTime / endTime / memo / labels / color`
- 旧 `actionType` / `actionResult` はロード時に `Type` / `Result` labelへmigration
- 保存は現行formatのみ

`NewTimelineData = Omit<TimelineData, 'id'>` を一括追加入力に使用します。`addTimelineDatas()` は複数eventを1回のstate updateで追加するため、自動Codingで多数eventを追加しても1回のUndoで戻せます。

## Code Window / Coding runtime

`.stcw` は独立ドキュメントとして扱います。コード／ラベル／編集モードは対象Code Window内で切り替え、アプリ全体のmodeにはしません。

Action buttonには `leadTimeSeconds` / `lagTimeSeconds` を保存できます。未設定は0秒です。Button clickとhotkey codingは同じ `resolveRecordingRange()` を通ります。

## 分析

分析windowの主要view:

- Dashboard
- Momentum
- Matrix
- AI Analysis

AI Analysisはローカル `llama.cpp` を使い、Timeline / labels / memo / statistics を根拠として分析文と推奨clipを生成します。映像frameそのものをLLMへ解釈させる機能ではありません。

## 自動イベント検出

自動イベント検出はLLM分析とは別のローカル映像処理です。SporTagLyticsは**配布済みmodel packを安全に実行するconsumer**であり、model training/evaluationは別private R&D repositoryの責務です。

目的は、通常Timelineを初期Codingして手動分析開始を早めることです。実作業では高Precisionな一部候補だけを出すのではなく、**実イベントをほぼすべて候補として出し、人間が不要候補を削除する**workflowを優先します。

### Renderer

`src/features/videoPlayer/eventDetection/`:

- `components/EventDetectionDialogView.tsx`: props-only View。model status、評価値、experimental warningを表示
- `hooks/useEventDetectionController.ts`: model/angle選択、confidence設定、実行、Timeline反映
- `gateway/eventDetectionGateway.ts`: `window.electronAPI.eventDetection` のみ使用し、model listをruntime guardで再検証
- `domain/eventDetectionMappings.ts`: event mapping、manifest初期threshold、ユーザー入力の正規化
- `domain/candidatesToTimeline.ts`: confidence filter、lead/lag、重複除外、Timeline変換

UIは `分析 > 自動イベント検出…` から開きます。検出後のeventは通常 `TimelineData` になり、専用AI Timelineやreview queueは持ちません。

model statusは `verified | experimental` の2状態です。experimentalを選ぶと`試験` badge、誤検出・見逃しの警告、Recall / Precision / evaluated matches / baseline confidence thresholdを表示します。confidence thresholdは0.00〜1.00でrunごとに変更できます。

### Shared contracts

- `src/types/eventDetection/core.ts`
- `src/types/ipc/eventDetection.ts`
- `src/shared/eventDetection/modelQualityGate.ts`

初期対象event type:

- `restart`
- `scrum`
- `lineout`

`maul` / `goalKick` はshared contractには定義できますが、model packで独立に評価され、statusごとのeligibilityを満たした場合だけproduct UIへ出します。

### Electron / local runner

`electron/src/eventDetection/`:

- `modelDiscovery.ts`: model pack / manifest探索、status別eligibility、runner integrity検証
- `eventDetectionManager.ts`: runnable model解決
- `processRunner.ts`: child process実行
- `requestRegistry.ts`: cancel管理
- `types.ts`: internal manifest / runnable model型

Runner contract:

```text
runner --request <request.json> --output <result.json> --model-dir <model-directory>
```

verified/experimental共通制約:

- `shell: false`
- finite timeout
- bounded stderr/result size
- cancel可能
- request/result temporary fileは完了後削除
- runner executableはmanifestのSHA-256と一致必須
- path traversal拒否
- main IPC sender/payload validation
- renderer gatewayでmodel metadata validation

ML runtime（ONNX Runtime等）はrunner内部の実装詳細として交換可能にし、rendererを特定ML frameworkへ直接依存させません。

### Status別 eligibility

`verified` model packはclass単位で最低限以下を満たす必要があります。experimental対応でこの基準は緩和しません。

- Recall >= 0.95
- unseen evaluation matches >= 5
- Precisionは0〜1の有限値として記録
- confidence thresholdは0〜1の有限値

`experimental`はverified gate通過扱いにせず、宣言eventごとのmetricsが有効で、current platform runnerが共通セキュリティ検証を通過した場合だけ別statusのまま利用可能にします。

高Recall operating pointでのfalse positives per match、処理時間、manual edit operations、手Coding比の作業時間削減はprivate R&D qualificationで確認します。秒単位の厳密なevent onsetは主目的ではありません。

### Model pack staging

`resources/event-detection-models/` はrelease/local build用の任意staging pointです。model pack本体は`.gitignore`で除外し、`electron-builder`が存在するpackだけを`event-detection-models`へ`extraResources`として配置します。stagingが空でも通常buildは成立します。

詳細: [自動イベント検出](event-detection.md)、[ADR 0023](adr/0023-external-rugby-event-model-rd-boundary.md)、[ADR 0024](adr/0024-experimental-event-detection-production-lane.md)

## Event Model R&D boundary

SporTagLytics public repositoryには以下を置きません。

- 元動画 / `.stpkg` / Coding dataset
- dataset preparation / training / fine-tuning
- hard-negative mining
- model family比較
- threshold / NMS / stride探索
- held-out qualification
- private source diagnostics
- frames / checkpoints / runs
- deployable model binary / checkpoint

一般ユーザーPCごとの自動fine-tuningや暗黙のtraining data uploadも初期製品では行いません。

## Playlist / Clip export

Playlistは独立BrowserWindowで扱い、`.stpl` documentを正本とします。Timelineからの追加とAI Analysisからの追加は共通playlist APIを利用します。

Clip exportは `src/shared/clipExport/` にpure service / contractを集約し、main processのFFmpeg runnerで実行します。進捗は専用export progress windowへ通知し、main app操作をblockしません。

配布版FFmpeg/FFprobeは固定source/hashからbuildしたverified toolchainのみ利用し、main processでtimeout/output上限を適用します。

## Persistence / migration

互換性は最新domain型へlegacy fieldを残すのではなくロード時migrationで吸収します。

- settings: `src/types/settings/normalizers.ts`
- coding panel: `src/types/settings/codingPanelNormalizers.ts`
- timeline labels: load-time migration
- package config: legacy media model migration

保存時は最新formatへ統一します。

## Quality gates

通常PRで必須:

```bash
pnpm exec tsc --noEmit
pnpm exec tsc -p electron/tsconfig.json
pnpm run lint
pnpm run check:architecture
pnpm run test:run
```

ADR変更時:

```bash
pnpm run check:adr
```

GitHub Actions `quality-check` は `main` / `develop` / `feat**` 宛てpull requestで上記相当の検証を実行します。Model R&DのCIはprivate repository側で管理します。

## 分析ワークスペースの表示境界

UIのsemantic tokenとテーマは `src/design-system/` に集約する。開始画面のファイル選択とウィザードは `VideoPathSelector` が、ショートカットガイドは `VideoController` が組み立てる。表示Viewはpropsで再現し、Storybookの `Workspace/*` を実画面の視覚確認に使う。保存・IPC・分析モデルの契約は変更しない。

## Playlist Paint

Playlistに描画編集用のPaintモードを追加。通常レビューと同じ映像DOMを維持し、アングル別の注釈を既存Playlist履歴・保存経路に反映する。編集状態はwindow-onlyで、図形・静止時間に加え、位置キーフレームとアングル別の平面較正・芝色設定を保存する。描画とPNG出力は共通レンダラーを使用し、書き出しは時刻別のfreezeFramesと、静止挿入前の映像時間に配置するmotionOverlaysを扱う。設計理由は[ADR 0028](adr/0028-playlist-studio-annotation-contract.md)。

### Paint と再生操作の共有

`MovieTransportView` はprops-onlyなshared UIで、再生・送りのコールバックとラベルだけを受け取る。メイン映像、Playlist overlay、Paint transportが合成する。Paintの `tacticalDrawing.ts` はビーム・ディスク・リンク・曲線の純粋canvas rendererで、通常レビューとPNG出力からも共通利用する。リンクの選手座標はDrawingObject.pathに保持し、表示サイズへの変換とジェスチャー完了時の保存を分ける。Coach表示はadapter hookのwindow-only状態で、文書・順序・映像DOMを複製しない。

Paintの動画描画はソース時刻と基準解像度の平行移動キーフレームを正本とし、requestVideoFrameCallbackで再生映像へ同期する。追跡は別のHTMLVideoElementで解析し、結果の明示的適用時だけ既存Undo履歴へ反映する。芝色マスクと平面較正はアングル別の注釈メタデータ。永続化時の不正な拡張データは読込エラーにして無言の欠落を防ぐ。詳細は[ADR 0029](adr/0029-tactics-motion-and-plane-contract.md)。

描画モードの表示名はPaint。PlaylistReviewViewはprops-onlyのツールスロットを持ち、モード有効時だけ左パレットを合成する。ツールによって動画の座標領域を覆わず、ResizeObserverから得た実際の映像領域を引き続き描画の基準にする。

映像操作面はHudl Sportscodeの現行公式動画を参照したフラットな黒いフッターへ更新。再生操作のshared Viewとmedia semantic tokenをメイン・Playlist・Paintで共有し、再生状態やシーク処理は既存controllerを維持する。

Paintは映像直下に再生操作、その下に数値目盛りと連続した描画レイヤーを配置する。左パレットは選択・描画・選手で分類する。バーの選択は対象図形を選び開始時刻へseekし、キーフレームの菱形は24pxの操作領域を持つ。いずれもprops-only Viewの変更で、注釈モデル・保存・追跡・書き出しの契約は維持する。

映像ウィンドウはsharedのuseVideoWindowAspectから映像領域外の幅・高さを測定し、検証付きvideo-window:set-aspect IPCで送信元ウィンドウを制約する。1映像、2映像横並び、3/4映像2×2の比率と実メタデータを使用する。追尾は周辺の特徴点を初期位置に選び、成功結果を既存Undo経路へ自動反映する。部分結果は明示適用、解析中の編集があれば結果を破棄する。

ウィンドウ比率固定の対象はメイン映像のみ。Playlistから寸法制約Hookを除去し、自由リサイズへ戻した。追尾は単一点から複数点・2サイズの模様・往復照合・移動の合意判定へ変更し、最大1280px幅・30Hzで解析する。保存形式とUndo経路は維持する。
