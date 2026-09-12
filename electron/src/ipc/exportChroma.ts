import type { ChromaKey } from '../../../src/shared/tactics/chromaKey';
import { isPlainObject } from './ipcPayloadGuards';
export const isExportChroma = (value: unknown): boolean =>
  value === undefined ||
  (isPlainObject(value) &&
    Object.entries(value).every(
      ([target, key]) =>
        (target === 'primary' || target === 'secondary') &&
        (key === undefined ||
          (isPlainObject(key) &&
            typeof key.color === 'string' &&
            /^#[0-9a-fA-F]{6}$/.test(key.color) &&
            typeof key.similarity === 'number' &&
            Number.isFinite(key.similarity) &&
            key.similarity >= 0.01 &&
            key.similarity <= 0.5 &&
            typeof key.blend === 'number' &&
            Number.isFinite(key.blend) &&
            key.blend >= 0 &&
            key.blend <= 1)),
    ));
export const prepareChromaForeground = (
  filters: string[],
  label: string,
  key: ChromaKey | undefined,
  prefix: string,
): string => {
  if (!key) return label;
  filters.push(`${label}split[${prefix}base][${prefix}source]`);
  filters.push(
    `[${prefix}source]format=rgba,colorkey=0x${key.color.slice(1)}:${key.similarity}:${key.blend}[${prefix}foreground]`,
  );
  return `[${prefix}base]`;
};
export const restoreChromaForeground = (
  filters: string[],
  label: string,
  key: ChromaKey | undefined,
  prefix: string,
): string => {
  if (!key) return label;
  filters.push(`${label}[${prefix}foreground]overlay=0:0[${prefix}out]`);
  return `[${prefix}out]`;
};
