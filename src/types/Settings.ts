/**
 * アクションプリセット定義
 */
export interface ActionPreset {
  /** プリセットの一意なID */
  id: string;
  /** プリセット名 */
  name: string;
  /** このプリセットに含まれるアクション */
  actions: ActionDefinition[];
  /** 並び順 */
  order: number;
}

/**
 * 個別のアクション定義
 */
export interface ActionDefinition {
  /** アクション名 */
  action: string;
  /** 結果の選択肢リスト */
  results: string[];
  /** タイプの選択肢リスト */
  types: string[];
}

/**
 * ホットキー設定
 */
export interface HotkeyConfig {
  /** コマンドID */
  id: string;
  /** コマンドの説明 */
  label: string;
  /** キーバインド（例: "Command+Shift+S"） */
  key: string;
  /** 無効化フラグ */
  disabled?: boolean;
}

/**
 * テーマモード
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * アプリケーション設定全体
 */
export interface AppSettings {
  /** テーマモード */
  themeMode: ThemeMode;
  /** 現在アクティブなプリセットID */
  activePresetId: string;
  /** カスタムアクションプリセット */
  actionPresets: ActionPreset[];
  /** ホットキー設定 */
  hotkeys: HotkeyConfig[];
  /** 言語設定（将来の拡張用） */
  language: string;
}

/**
 * デフォルト設定値
 */
export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  activePresetId: 'default',
  actionPresets: [],
  hotkeys: [],
  language: 'ja',
};
