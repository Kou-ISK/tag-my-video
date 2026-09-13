import {
  getKeyboardPlatform,
  usesAppleKeyboard,
  formatShortcutLabel,
} from '../../../utils/platformShortcut';
import { parseElectronKey } from '../../../hooks/globalHotkeyUtils';
import type { HotkeyConfig } from '../../../types/settings/coreTypes';
import { FORBIDDEN_HOTKEYS } from './hotkeySettings.constants';

export const formatKeyCombo = (
  event: KeyboardEvent,
  platform = getKeyboardPlatform(),
): string => {
  const keys: string[] = [];
  if (event.metaKey)
    keys.push(usesAppleKeyboard(platform) ? 'CommandOrControl' : 'Meta');
  if (event.ctrlKey)
    keys.push(usesAppleKeyboard(platform) ? 'Control' : 'CommandOrControl');
  if (event.altKey) keys.push('Alt');
  if (event.shiftKey) keys.push('Shift');

  if (event.key && !['Meta', 'Control', 'Alt', 'Shift'].includes(event.key)) {
    const keyName =
      event.key.length === 1 ? event.key.toUpperCase() : event.key;
    keys.push(keyName);
  }

  return keys.join('+');
};

export const getHotkeyConflictWarning = (params: {
  keyCombo: string;
  editingId: string;
  hotkeys: HotkeyConfig[];
}): string | null => {
  const platform = getKeyboardPlatform();
  const signature = (key: string): string =>
    JSON.stringify(parseElectronKey(key, platform));
  const keySignature = signature(params.keyCombo);
  const label = formatShortcutLabel(params.keyCombo, platform);
  if ([...FORBIDDEN_HOTKEYS].some((key) => signature(key) === keySignature)) {
    return `"${label}" はシステムで使用されているため設定できません`;
  }

  const duplicate = params.hotkeys.find(
    (hotkey) =>
      signature(hotkey.key) === keySignature && hotkey.id !== params.editingId,
  );
  if (duplicate) {
    return `"${label}" は既に「${duplicate.label}」に割り当てられています`;
  }

  return null;
};
