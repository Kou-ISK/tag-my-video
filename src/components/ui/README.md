# Shared UI Design System

このディレクトリは共通 UI のみを対象にした design-system 層です。

## 方針
- アプリ全体は Feature-First を維持する。
- Atomic Design はメンタルモデルとしてのみ利用する。
- 実装分類は `primitives / composites / patterns` を推奨する。

## 例
- `primitives`: Button, Chip, Dialog など最小単位
- `composites`: 複数 primitives の組み合わせ
- `patterns`: 画面横断で再利用する構造化 UI

## 現在の共通コンポーネント

- `primitives/IconAction`: Tooltip と accessible name を備えた icon-only action。視覚的な icon size と操作 target を分離します。
- `patterns/FloatingToolPanel`: Annotation / playback / inspector で共有する overlay surface。surface、border、elevation、z-index は theme token から取得します。
- `composites/CodeWindowButtonSurface`: Code Window の button surface。feature state や Electron API を参照しません。

新しい共通 UI を追加する前に、この一覧と `src/design-system` の token を確認してください。feature 固有の状態管理・IPC・domain logic はここへ置きません。
