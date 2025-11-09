import { app, ipcMain } from 'electron';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { AppSettings } from '../../src/types/Settings';

/**
 * 設定ファイルのパスを取得
 */
const getSettingsPath = (): string => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'settings.json');
};

/**
 * デフォルト設定値（型情報は src/types/Settings.ts と同期が必要）
 */
const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  activePresetId: 'default',
  actionPresets: [],
  hotkeys: [],
  language: 'ja',
};

/**
 * 設定を読み込む
 */
export const loadSettings = async (): Promise<AppSettings> => {
  const settingsPath = getSettingsPath();
  try {
    const data = await fs.readFile(settingsPath, 'utf-8');
    const parsed = JSON.parse(data) as Partial<AppSettings>;
    // デフォルト設定とマージして不足項目を補完
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    // ファイルが存在しない、またはパースエラーの場合はデフォルト設定を返す
    console.warn('Settings file not found or invalid, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * 設定を保存する
 */
export const saveSettings = async (settings: AppSettings): Promise<boolean> => {
  const settingsPath = getSettingsPath();
  try {
    const data = JSON.stringify(settings, null, 2);
    await fs.writeFile(settingsPath, data, 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

/**
 * IPCハンドラを登録
 */
export const registerSettingsHandlers = () => {
  ipcMain.handle('settings:load', async () => {
    return await loadSettings();
  });

  ipcMain.handle('settings:save', async (_event, settings: AppSettings) => {
    return await saveSettings(settings);
  });

  ipcMain.handle('settings:reset', async () => {
    // デフォルト設定に戻す
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  });
};
