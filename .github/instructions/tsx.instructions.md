---
applyTo: '**/*.tsx'
---

# TSX（React コンポーネント）向け指示
- コンポーネントは責務単位で分割し、ロジックは可能な限りカスタム Hook に移譲する。  
- UI レイアウトには MUI の `Box` / `Stack` / `Grid` を使用し、`sx` でレスポンシブ調整を行う。  
- `useEffect` / `useMemo` / `useCallback` には依存配列を正確に設定し、不要な再レンダリングを防ぐ。  
- `window.electronAPI` へアクセスする際は存在チェックを行い、例外発生時は `console.debug` で記録する。  
- タイムライン・分析 UI は空状態の表示 (`NoDataPlaceholder` 等) を忘れずに提供する。  
- i18n 方針としてユーザー向けテキストは日本語で記載し、ハードコード文字列を定数化する場合は `labels` 等のオブジェクトにまとめる。
