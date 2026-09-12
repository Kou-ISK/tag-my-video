import { expect, it } from 'vitest';
import { isExportMotionOverlays } from './exportMotionValidation';
const layer = {
  start: 0,
  end: 4,
  baseWidth: 800,
  baseHeight: 450,
  target: 'primary',
  png: 'data:image/png;base64,YQ==',
  keyframes: [
    { time: 0, x: 0, y: 0 },
    { time: 4, x: 100, y: 20 },
  ],
};
it('validates bounded numeric motion payloads before building ffmpeg expressions', () => {
  expect(isExportMotionOverlays([layer], 4)).toBe(true);
  expect(isExportMotionOverlays([{ ...layer, end: 5 }], 4)).toBe(false);
  expect(isExportMotionOverlays([{ ...layer, png: '/etc/passwd' }], 4)).toBe(
    false,
  );
  expect(
    isExportMotionOverlays(
      [{ ...layer, keyframes: [{ time: 0, x: '0);movie=secret', y: 0 }] }],
      4,
    ),
  ).toBe(false);
  expect(
    isExportMotionOverlays(
      [{ ...layer, keyframes: [...layer.keyframes].reverse() }],
      4,
    ),
  ).toBe(false);
  expect(
    isExportMotionOverlays(
      [{ ...layer, keyframes: [{ time: 0, x: NaN, y: 0 }] }],
      4,
    ),
  ).toBe(false);
});
