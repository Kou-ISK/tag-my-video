import { useState } from 'react';
import type {
  DrawingObject,
  DrawingToolType,
} from '../../../types/playlist/core';
import {
  readTacticsPreferences,
  writeTacticsPreferences,
} from './tacticsPreferencesGateway';
import type { TacticsPreferences } from './tacticsPreferencesGateway';
export interface TacticsPresetProps {
  preferences: TacticsPreferences;
  name: string;
  error: string;
  canSave: boolean;
  enabled: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onInsert: (id: string) => void;
  onDelete: (id: string) => void;
  onCoachToolToggle: (tool: DrawingToolType) => void;
  onCoachColorChange: (index: number, color: string) => void;
}
export const useTacticsPresets = (
  selected: DrawingObject | null,
  enabled: boolean,
  time: number,
  onAdd: (object: DrawingObject) => void,
): TacticsPresetProps => {
  const [preferences, setPreferences] = useState(readTacticsPreferences);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const save = (next: TacticsPreferences): void => {
    try {
      writeTacticsPreferences(next);
      setPreferences(next);
      setError('');
    } catch {
      setError(
        '設定を保存できませんでした。端末の空き容量を確認してください。',
      );
    }
  };
  return {
    preferences,
    name,
    error,
    enabled,
    canSave:
      enabled &&
      Boolean(selected) &&
      Boolean(name.trim()) &&
      preferences.presets.length < 24,
    onNameChange: setName,
    onSave: () => {
      if (selected && name.trim() && enabled && preferences.presets.length < 24)
        save({
          ...preferences,
          presets: [
            ...preferences.presets,
            {
              id: crypto.randomUUID(),
              name: name.trim().slice(0, 80),
              object: { ...selected, motion: undefined },
            },
          ],
        });
    },
    onInsert: (id) => {
      const preset = preferences.presets.find((entry) => entry.id === id);
      if (preset && enabled)
        onAdd({ ...preset.object, id: crypto.randomUUID(), timestamp: time });
    },
    onDelete: (id) =>
      save({
        ...preferences,
        presets: preferences.presets.filter((preset) => preset.id !== id),
      }),
    onCoachToolToggle: (tool) => {
      if (tool === 'select') return;
      save({
        ...preferences,
        coachTools: preferences.coachTools.includes(tool)
          ? preferences.coachTools.filter((entry) => entry !== tool)
          : [...preferences.coachTools, tool],
      });
    },
    onCoachColorChange: (index, color) => {
      if (/^#[a-fA-F0-9]{6}$/.test(color))
        save({
          ...preferences,
          coachColors: preferences.coachColors.map((entry, at) =>
            at === index ? color : entry,
          ),
        });
    },
  };
};
