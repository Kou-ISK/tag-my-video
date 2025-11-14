import type { ActionPreset, ActionDefinition } from '../types/Settings';

/**
 * プリセットをJSON形式でエクスポート
 */
export interface ExportedPreset {
  version: string;
  exportedAt: string;
  presets: ActionPreset[];
}

/**
 * プリセットをJSON文字列に変換
 */
export const exportPresetsToJSON = (presets: ActionPreset[]): string => {
  const exported: ExportedPreset = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    presets,
  };
  return JSON.stringify(exported, null, 2);
};

/**
 * プリセットをファイルとしてダウンロード
 */
export const downloadPresetsAsFile = (presets: ActionPreset[]): void => {
  const json = exportPresetsToJSON(presets);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `action-presets-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * ActionDefinitionのバリデーション
 */
const isValidActionDefinition = (obj: unknown): obj is ActionDefinition => {
  if (typeof obj !== 'object' || obj === null) return false;
  const action = obj as Record<string, unknown>;
  return (
    typeof action.action === 'string' &&
    Array.isArray(action.results) &&
    action.results.every((r) => typeof r === 'string') &&
    Array.isArray(action.types) &&
    action.types.every((t) => typeof t === 'string')
  );
};

/**
 * ActionPresetのバリデーション
 */
const isValidActionPreset = (obj: unknown): obj is ActionPreset => {
  if (typeof obj !== 'object' || obj === null) return false;
  const preset = obj as Record<string, unknown>;
  return (
    typeof preset.id === 'string' &&
    typeof preset.name === 'string' &&
    Array.isArray(preset.actions) &&
    preset.actions.every(isValidActionDefinition) &&
    typeof preset.order === 'number'
  );
};

/**
 * インポートしたJSON文字列をバリデーションしてプリセット配列に変換
 */
export const parseImportedPresets = (
  jsonString: string,
): {
  success: boolean;
  presets?: ActionPreset[];
  error?: string;
} => {
  try {
    const parsed = JSON.parse(jsonString);

    // バージョン1.0.0形式のチェック
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      'presets' in parsed
    ) {
      if (!Array.isArray(parsed.presets)) {
        return { success: false, error: 'presetsが配列ではありません' };
      }

      const presets = parsed.presets as unknown[];
      if (!presets.every(isValidActionPreset)) {
        return {
          success: false,
          error: 'プリセットの形式が正しくありません',
        };
      }

      return { success: true, presets };
    }

    // 直接配列形式のチェック（後方互換性）
    if (Array.isArray(parsed)) {
      if (!parsed.every(isValidActionPreset)) {
        return {
          success: false,
          error: 'プリセットの形式が正しくありません',
        };
      }
      return { success: true, presets: parsed };
    }

    return { success: false, error: '不正なファイル形式です' };
  } catch (err) {
    return {
      success: false,
      error: `JSONの解析に失敗しました: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
};

/**
 * ファイルからプリセットをインポート
 */
export const importPresetsFromFile = async (
  file: File,
): Promise<{
  success: boolean;
  presets?: ActionPreset[];
  error?: string;
}> => {
  try {
    const text = await file.text();
    return parseImportedPresets(text);
  } catch (err) {
    return {
      success: false,
      error: `ファイルの読み込みに失敗しました: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
};

/**
 * インポート時にIDの重複を解決
 */
export const resolvePresetIdConflicts = (
  existingPresets: ActionPreset[],
  newPresets: ActionPreset[],
): ActionPreset[] => {
  const existingIds = new Set(existingPresets.map((p) => p.id));
  const timestamp = Date.now();

  return newPresets.map((preset, index) => {
    let id = preset.id;
    // デフォルトプリセットとの衝突を避ける
    if (id === 'default') {
      id = `imported_default_${timestamp}_${index}`;
    }
    // 既存のIDとの衝突を避ける
    while (existingIds.has(id)) {
      id = `${preset.id}_${timestamp}_${index}`;
    }
    existingIds.add(id);

    return {
      ...preset,
      id,
      order: existingPresets.length + index,
    };
  });
};
