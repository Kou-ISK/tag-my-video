# 開発ガイド

実装規約の正本はリポジトリルートの `AGENTS.md` です。本書はSporTagLyticsアプリ本体の開発環境、日常ワークフロー、品質ゲート、event detection runtime境界の実務ガイドです。

## 開発環境

| ツール  | バージョン |
| ------- | ---------- |
| Node.js | 22.12以上  |
| pnpm    | 9.1.0以上  |
| Git     | 最新版     |

通常のElectron開発・配布にPython runtimeは不要です。Event modelのtraining/evaluationは別private R&D repositoryで管理します。

```bash
git clone <repository-url>
cd sportaglytics
pnpm install --frozen-lockfile
pnpm run electron:dev
```

## 技術スタック

- React 19 / TypeScript / Material UI 7
- Electron 43 / Video.js 8 / Vite 7 / Vitest 4
- local-first desktop application
- RendererはNode/Electron APIを直接使用せずtyped preload APIを経由
- event detectionはstatus-aware model packをbounded child processとして実行

Training frameworkやdataset preparation dependencyはSporTagLytics packageへ含めません。

## ビルドと実行

```bash
pnpm run build
pnpm run build:electron-main
pnpm run bundle:preload
pnpm run check:preload
pnpm run electron:start
```

macOS package:

```bash
pnpm run electron:package:mac
```

配布版media toolchainは `scripts/build-media-tools.mjs` と ADR 0020 に従います。

### Event detection model packを含める場合

配布model packはGitへcommitせず、build前に次へstagingします。

```text
resources/event-detection-models/<model>/
```

`electron-builder`はこのdirectoryをpackaged appの`event-detection-models`へ`extraResources`として配置します。staging directoryが空でも通常buildは成立します。

stagingへ置くのはsanitized deployable model packだけです。raw video、`.stpkg`、frames、research runs、checkpoints、private source metadataは置きません。

## 開発ワークフロー

1. `develop` 最新からbranchを作る。
2. `<prefix>/<short-kebab-description>` を使う。
3. 実装と同じPRでtest/doc/ADRを更新する。
4. 全品質ゲートを実行する。
5. `develop` 宛てPRを作る。
6. CI結果を確認して失敗を修正する。

通常prefix: `feature`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`。
CommitはConventional Commitsを使います。

## 品質ゲート

PR merge前に必須:

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

Preload / packaged Electron変更時:

```bash
pnpm run build:electron-main
pnpm run bundle:preload
pnpm run check:preload
```

E2E:

```bash
pnpm run test:e2e
```

GitHub Actions `quality-check` は `main` / `develop` / `feat**` 宛てpull requestでfrozen install、lint、renderer/electron typecheck、architecture、ADR、Vitestを実行します。

## アーキテクチャ

詳細は [System Overview](system-overview.md) と [Project Structure](project-structure.md) を参照してください。

依存方向:

```text
pages -> features -> shared
```

Renderer / Electron boundary:

```text
View
  ↑ props/callback
Controller / Hook
  ↓
Gateway
  ↓
window.electronAPI
  ↓
typed preload / IPC
  ↓
Electron main manager / child process
```

`src` から `electron` / `ipcRenderer` を直接importしません。

## 自動イベント検出の開発

- 詳細仕様: [自動イベント検出](event-detection.md)
- R&D境界: [ADR 0023](adr/0023-external-rugby-event-model-rd-boundary.md)
- experimental production lane: [ADR 0024](adr/0024-experimental-event-detection-production-lane.md)

### Product policy

自動イベント検出は通常Timelineを初期Codingする補助機能です。model statusは`verified | experimental`を明示的に区別します。

`verified`は既存runtime quality gateを満たしたclassだけを公開します。`experimental`は評価中の別レーンであり、verified gate通過扱いにしません。experimentalをproduction UIへ表示する場合は、試験badge、警告、class別Recall / Precision / evaluated matches / baseline confidence thresholdを必ず見せます。

実作業では、少数の高Precision候補だけを出すより、**ほぼ全イベントを候補として出して不要なものを削除する**workflowを優先します。そのためruntime minimumはRecall優先で、model採用時にはprivate R&D側でfalse positives per match、処理時間、manual edit operations、手Coding比の作業時間削減まで確認します。

### Model packとアプリ本体を分離する

```text
Renderer
  ↓ window.electronAPI.eventDetection
Preload
  ↓ typed IPC
Electron main
  ↓ status-aware runnable model
Model-pack runner
  ↓
ML runtime / model files
```

Runner内部はONNX Runtime等へ交換できますがrenderer contractは変えません。

探索先:

```text
resources/event-detection-models/<model>/
<Resources>/event-detection-models/<model>/
<Electron userData>/event-detection-models/<model>/
```

Model manifestにはschema/version/id、`status: verified | experimental`、supported events、class別metrics、評価時confidence threshold、platform runner relative path、runner SHA-256を含めます。

共通検証はmanifest構造、metric range、current platform runner、path containment、runner SHA-256です。`verified`はさらにminimum runtime gateを再検証します。`experimental`はquality gateを緩めるのではなく、共通検証を通った別statusとしてUIへ伝播します。

### Product runtime gate

Verified event class単位:

| Metric                    |      Minimum |
| ------------------------- | -----------: |
| Recall                    |         0.95 |
| unseen evaluation matches |            5 |
| Precision                 | 0〜1の有限値 |
| confidence threshold      | 0〜1の有限値 |

Precision単独でmodelを昇格させません。秒単位の厳密なevent onsetも主目的ではありません。

Experimental modelでは宣言eventごとにmetricsが必要ですが、evaluated match数が5未満でも`experimental`のまま実行できます。これはproduct workflow評価のためであり、`verified`へのpromotion条件には影響しません。

### Confidence threshold

UIはmanifestの`confidenceThreshold`を初期値として表示し、runごとに0.00〜1.00で調整できます。

- 低くする: Recallを取りやすい一方、false positiveが増えやすい
- 高くする: false positiveを減らしやすい一方、見逃しが増えやすい

入力値はdomain層で有限値・範囲を正規化します。ユーザー変更はmanifestや保存済み評価metricsを書き換えません。

### Private R&D boundary

次はSporTagLytics repositoryの責務ではありません。

- dataset discovery / preparation
- training / fine-tuning
- hard-negative mining
- model family比較
- threshold / NMS / stride探索
- held-out qualification
- private source diagnostics
- model export

元動画、`.stpkg`、Timeline Coding、frames、checkpoints、runs、deployable model binaryをpublic repositoryへcommitしません。一般ユーザーPCごとの自動fine-tuningも初期製品では行いません。

### Runner protocol

Electronから:

```text
runner --request <request.json> --output <result.json> --model-dir <model-directory>
```

Main process側はstatusに関係なく `shell: false`、finite timeout、output/stderr cap、cancel、request/result cleanup、path traversal、runner SHA-256、result payload validationを担当します。

### Timeline integration

Model outputは直接persisted `timeline.json` を書き換えません。Renderer domainで現在のconfidence threshold、enabled event、lead/lag、duplicate suppressionを適用して `NewTimelineData[]` へ変換し、`addTimelineDatas()` で1 state updateとして追加します。

自動追加後は通常の `TimelineData` として扱います。experimental provenanceをTimeline schemaへ保存しません。

## テストとデバッグ

```bash
pnpm run test:run
```

Event detection関連では次をtestします。

- recording range
- confidence filter / duplicate suppression
- confidence threshold編集とclamp
- verified Recall-first quality gateが変わっていないこと
- experimental manifest eligibility
- unknown status / malformed metric rejection
- current-platform runner / path traversal / runner SHA-256
- renderer model metadata guard
- experimental warning / metrics表示
- IPC/process boundary

Model packがUIへ出ない場合:

1. manifest JSON
2. `status: verified | experimental`
3. class metricsの有限値・範囲
4. verifiedの場合はclass recall / evaluated match count
5. confidence threshold
6. current platform/architecture runner
7. runner SHA-256
8. runner path traversal

を確認します。

Model training/evaluationのdebuggingはprivate R&D repositoryで行います。

## リリースプロセス

1. release準備変更を `develop` へ統合
2. 必要なsanitized event-detection model packをCI/local stagingへ配置
3. `develop -> main` PR
4. main PR品質ゲート
5. merge後のmain commitへrelease tag
6. package/release assets作成

`main` への直接push/mergeは行いません。Event detection model packはアプリreleaseと独立できます。

## ドキュメント運用

変更時は [Docs Impact Matrix](documentation-guide.md#docs-impact-matrix) に従います。

- user behavior → `user-guide.md`, `requirement.md`
- IPC/architecture → `system-overview.md`
- directory配置 → `project-structure.md`
- build/script → `development.md`, `testing.md`
- 長期判断 → `docs/adr/`
- user/contributor visible → `CHANGELOG.md`

## UI変更の一括検証

`pnpm run verify` はRenderer/Electronの型検査、lint、architecture/design-system/ADR検査、unit tests、アプリbuild、Storybook buildを順に実行する。UI調整をまとめた後に実行できる。`pnpm run storybook` の `Design System/Foundation/Controls` と `Workspace/*` でdark/light、空状態、長い名称、無効操作、狭い幅を確認する。

## Native UI / Paint の確認

`pnpm run verify`で型、Electron型、lint、architecture、design-system、ADR、テスト、アプリbuild、Storybook buildを一括検証する。Storybookの `Workspace/Playlist/Paint` はElectron不要の描画fixture、`Workspace/Timeline/Continuous` はrulerと行の共有座標を確認するView story。Paintでは描画・移動・拡縮・レイヤー・Undo/Redoを、Timelineではズームと縦横スクロール後のシーク位置を確認する。映像の再生・ファイル保存・FFmpeg書き出しはElectron実機でも確認する。

### Movie Controller / Paint の確認

Storybook `Design System/Composites/Movie Transport`、`Workspace/Transport`、`Workspace/Playlist/Paint` で確認する。Interactive storyは戦術図のfixture、Video Tracking storyは実際にデコードする合成WebMを使用し、追跡・平面較正・芝色処理・プリセットを操作できる。ビームの高さ、曲線の曲がり、リンク各点のドラッグと選手数、Coachの消去→Undo、明暗テーマと狭い幅を確認する。図形の変更時は `tacticalGeometry.test.ts` と `useStudioGesture.test.tsx` の保存座標・letterbox・1操作1履歴の検証も維持する。

Paintの時間・較正・芝色の純粋計算は `src/shared/tactics`、外部動画の解析は `studio/tracking`、端末プリセットの永続化は `tacticsPreferencesGateway.ts` が担当する。Video Tracking storyでは、結果適用→中間時刻の手修正→再追跡、較正取消、プリセット挿入Undoを確認する。追跡fixtureは320×180・4秒の合成WebMで実動画デコーダーを使う。書き出しはElectronのFFmpeg経路でも、単一/二映像・静止挿入・音声のない素材・芝色処理を確認する。[対応範囲](tactics.md)と[ADR 0029](adr/0029-tactics-motion-and-plane-contract.md)を参照。

Paint改修の確認: 左パレット選択→映像へ描画→自動選択→移動、ツールの文字キー、入力欄への文字入力、Esc中止を確認する。Playlistのペン目印をクリックした際、対象時刻へのseekと確定callbackが動くことを確認する。従来の内部studio識別子、Tactics型名、プリセット保存キーは維持する。

再生UIの参照は旧SportsCodeマニュアルから2026年3月版のHudl公式紹介動画へ変更した。参照時期と画面の根拠はdesign-system.mdに記録する。Storybookで黒い映像操作面が明暗両テーマで読めること、Playlistの描画目印と送り操作が動くことを確認する。

Paintの時間軸確認: 再生操作が数値目盛りの上にあること、描画バー選択で開始時刻へseekすること、キーフレームの移動、目盛りと全行の再生線の一致を確認する。選択・描画・選手パレットの選択状態を明暗テーマで確認する。公開製品画像と最新リリースの版番号は同一と推定しない。
