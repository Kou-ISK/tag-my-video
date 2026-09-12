import { isPlainObject } from './ipcPayloadGuards';
export const isExportMotionOverlays = (
  value: unknown,
  clipDuration: number,
): boolean => {
  if (value === undefined) return true;
  if (!Array.isArray(value) || value.length > 64) return false;
  let totalKeys = 0;
  return value.every((entry: unknown) => {
    if (
      !isPlainObject(entry) ||
      typeof entry.png !== 'string' ||
      entry.png.length > 16_000_000 ||
      !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(entry.png)
    )
      return false;
    if (entry.target !== 'primary' && entry.target !== 'secondary')
      return false;
    for (const field of ['start', 'end', 'baseWidth', 'baseHeight'])
      if (typeof entry[field] !== 'number' || !Number.isFinite(entry[field]))
        return false;
    const { start, end, baseWidth, baseHeight } = entry;
    if (
      typeof start !== 'number' ||
      typeof end !== 'number' ||
      typeof baseWidth !== 'number' ||
      typeof baseHeight !== 'number' ||
      start < 0 ||
      end < start ||
      end > clipDuration ||
      baseWidth <= 0 ||
      baseHeight <= 0
    )
      return false;
    if (
      !Array.isArray(entry.keyframes) ||
      !entry.keyframes.length ||
      entry.keyframes.length > 256
    )
      return false;
    totalKeys += entry.keyframes.length;
    if (totalKeys > 4096) return false;
    let previous = -1;
    return entry.keyframes.every((key: unknown) => {
      if (
        !isPlainObject(key) ||
        typeof key.time !== 'number' ||
        typeof key.x !== 'number' ||
        typeof key.y !== 'number' ||
        ![key.time, key.x, key.y].every(Number.isFinite) ||
        key.time <= previous ||
        key.time < 0 ||
        key.time > 600 ||
        Math.abs(key.x) > 100000 ||
        Math.abs(key.y) > 100000
      )
        return false;
      previous = key.time;
      return true;
    });
  });
};
