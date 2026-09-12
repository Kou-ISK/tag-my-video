import type {
  DrawingObject,
  DrawingToolType,
} from '../../../types/playlist/core';
import { STUDIO_TOOLS } from './studioGeometry';
export interface TacticsPreset {
  id: string;
  name: string;
  object: DrawingObject;
}
export interface TacticsPreferences {
  presets: TacticsPreset[];
  coachTools: DrawingToolType[];
  coachColors: string[];
}
export const defaultTacticsPreferences: TacticsPreferences = {
  presets: [],
  coachTools: [
    'select',
    'beam',
    'disc',
    'linkedDiscs',
    'curvedArrow',
    'pen',
    'spotlight',
    'text',
  ],
  coachColors: ['#FFD60A', '#FFFFFF', '#64A9FF', '#FF453A'],
};
const key = 'sportaglytics.tactics.preferences.v1';
const plain = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const tool = (value: unknown): value is DrawingToolType =>
  typeof value === 'string' && STUDIO_TOOLS.some((entry) => entry.id === value);
const drawing = (value: unknown): value is DrawingObject => {
  if (
    !plain(value) ||
    typeof value.id !== 'string' ||
    !tool(value.type) ||
    typeof value.color !== 'string' ||
    !/^#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(value.color)
  )
    return false;
  if (
    !['startX', 'startY', 'timestamp', 'strokeWidth'].every(
      (field) =>
        typeof value[field] === 'number' && Number.isFinite(value[field]),
    )
  )
    return false;
  if (
    value.path !== undefined &&
    (!Array.isArray(value.path) ||
      value.path.length > 10000 ||
      value.path.some(
        (point: unknown) =>
          !plain(point) ||
          typeof point.x !== 'number' ||
          typeof point.y !== 'number' ||
          !Number.isFinite(point.x) ||
          !Number.isFinite(point.y),
      ))
  )
    return false;
  for (const name of [
    'endX',
    'endY',
    'baseWidth',
    'baseHeight',
    'fontSize',
    'opacity',
    'curvature',
    'discRadius',
  ])
    if (
      value[name] !== undefined &&
      (typeof value[name] !== 'number' || !Number.isFinite(value[name]))
    )
      return false;
  if (
    value.text !== undefined &&
    (typeof value.text !== 'string' || value.text.length > 8192)
  )
    return false;
  // プリセットは図形とスタイルのみ。時系列の追跡結果を端末設定へ保存しない。
  return value.motion === undefined;
};
export const readTacticsPreferences = (): TacticsPreferences => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (!plain(value)) return defaultTacticsPreferences;
    const presets = Array.isArray(value.presets)
      ? value.presets
          .filter(
            (entry): entry is TacticsPreset =>
              plain(entry) &&
              typeof entry.id === 'string' &&
              typeof entry.name === 'string' &&
              drawing(entry.object),
          )
          .slice(0, 24)
      : [];
    return {
      presets,
      coachTools:
        Array.isArray(value.coachTools) && value.coachTools.some(tool)
          ? value.coachTools.filter(tool)
          : defaultTacticsPreferences.coachTools,
      coachColors:
        Array.isArray(value.coachColors) &&
        value.coachColors.length === 4 &&
        value.coachColors.every(
          (color) =>
            typeof color === 'string' && /^#[a-fA-F0-9]{6}$/.test(color),
        )
          ? value.coachColors
          : defaultTacticsPreferences.coachColors,
    };
  } catch {
    return defaultTacticsPreferences;
  }
};
export const writeTacticsPreferences = (
  preferences: TacticsPreferences,
): void => localStorage.setItem(key, JSON.stringify(preferences));
