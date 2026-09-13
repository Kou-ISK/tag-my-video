// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { parseElectronKey, matchesHotkeyEvent, shouldResetPlaybackHotkeyState } from '../hooks/globalHotkeyUtils';
import { normalizeAppSettings } from '../types/settings/normalizers';
import { formatKeyCombo } from '../features/settings/components/hotkeySettings.utils';
import { formatShortcutLabel, normalizePortableShortcut } from './platformShortcut';

describe('portable shortcuts', () => {
  it('maps the same saved shortcut to Ctrl on Windows and Command on Mac', () => {
    for (const [platform, ctrlKey, metaKey] of [['Win32', true, false], ['MacIntel', false, true]] as const) {
      expect(matchesHotkeyEvent({ key: 's', code: 'KeyS', ctrlKey, metaKey, altKey: false, shiftKey: false },
        parseElectronKey('CommandOrControl+S', platform))).toBe(true);
    }
    expect(formatShortcutLabel('CommandOrControl+Alt+S', 'Win32')).toBe('Ctrl+Alt+S');
    expect(formatShortcutLabel('CommandOrControl+Alt+S', 'MacIntel')).toBe('⌘+⌥+S');
  });

  it('migrates existing Mac settings at the load boundary', () => {
    const settings = normalizeAppSettings({ hotkeys: [{ id: 'undo', key: 'Command+Z' }] });
    expect(settings.hotkeys.find(({ id }) => id === 'undo')?.key).toBe('CommandOrControl+Z');
    expect(normalizePortableShortcut('Cmd+Option+Right')).toBe('CommandOrControl+Alt+Right');
  });

  it('captures Windows Ctrl as a portable primary modifier, retaining explicit Mac Control', () => {
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    expect(formatKeyCombo(event, 'Win32')).toBe('CommandOrControl+K');
    expect(formatKeyCombo(event, 'MacIntel')).toBe('Control+K');
    expect(shouldResetPlaybackHotkeyState({ key: 'Control', code: 'ControlLeft' })).toBe(true);
  });
});
