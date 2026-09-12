# 0032 Immutable release artifacts

## Status

Accepted

## Date

2026-09-13

## Related ADRs

- Supersedes: N/A
- Superseded by: N/A

## Context

Homebrew Caskはバージョンに対応するDMGのSHA256を保持する。同じ版のタグとReleaseを削除して再生成すると、既に取得した利用者と後から取得した利用者で内容が変わり、チェックサムと配布履歴の信頼性が失われる。

## Decision

リリースのタグ、package.jsonのversion、mainに統合したcommitを照合してからビルドする。インストールはlockfile固定とし、公開は既存Releaseがあれば失敗するcreate操作で行う。公開済みのタグ・DMGを自動削除しない。アプリ修正は新バージョンとして公開し、Homebrew更新だけが失敗した場合は既に公開したDMGのSHA256で復旧する。

## Consequences

同じバージョンのダウンロードを再現可能な識別子として扱える。公開後の再実行はパッケージの置換に使えない。署名・ビルド・E2E・監査の失敗を解消してから初回公開し、Homebrewへの反映とRelease公開を別々に確認する。
