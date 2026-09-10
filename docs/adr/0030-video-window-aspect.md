# 0030 Video window aspect

## Status

Accepted

## Date

2026-09-10

## Related ADRs

- Supersedes: N/A
- Superseded by: N/A

## Context

自由な縦横リサイズは映像の周囲に不要な余白を作る。Playlistにはサイドバー・描画時間軸もあり、ウィンドウ全体へ映像比率をそのまま適用すると映像が歪む。

## Decision

Rendererの共通Hookが映像以外の領域を測定し、専用の型付きIPCで送信元のウィンドウに比率を設定する。Mainはsenderと有限な比率・寸法を検証し、ElectronのsetAspectRatioのextraSizeへ映像以外の寸法を渡す。変更時は現在の幅と画面の高さ、最小寸法から初期サイズを調整する。Hook終了時に制約を解除する。通常Playlistの上下分割は高さの比率も補正し、ウィンドウのリサイズで除外領域が増減しても反復リサイズを生まない。

映像セルは1枚、2枚横並び、3/4枚は2×2。混在比率では最も横長のセルに合わせ、映像はcontainを維持する。切り抜きや伸縮はしない。全画面・最大化はディスプレイの寸法を優先する。

## Consequences

Viewsは引き続きIPC非依存。macOSではサイドバー等を除いた映像領域の比率を固定できる。異なるソース比率、3映像の空きセル、全画面の余白は残る。extraSizeはElectronではmacOS用のため、他OSのウィンドウマネージャーでの同一挙動は保証しない。

参考: [Electron BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window/#winsetaspectratioaspectratio-extrasize)
