# 0027 Enforced design system foundation

## Status

Accepted

## Date

2026-08-30

## Related ADRs

- Supersedes: N/A
- Superseded by: N/A

## Context

Themeと設計文書は存在していたが、featureごとにoverlay、色、z-index、文字密度が再定義され、UIの一貫性はレビューに依存していた。

## Decision

- foundation / semantic tokenを `src/design-system` に置き、MUI Themeと独立Help Windowの双方が同じ定義を使う。
- 再利用するUIは `src/components/ui` のprops-only patternに限定し、全MUI componentのwrapper化は行わない。
- Storybookのdark/light decoratorとa11y addonを導入し、shared UIとtokenをvisual regressionの基準にする。
- `check:design-system` とStorybook buildをCI品質ゲートへ追加する。

## Consequences

- 新規UIはsemantic token、shared pattern、feature compositionの順で実装する。
- data / canvas /ユーザー設定色はUI chromeではないため明示的な例外として扱う。
- 既存UIは一括書き換えせず、変更時に段階的にtokenへ移行する。
