import { expect, it } from 'vitest';
import { isExportFreezeFrames } from './exportFreezeFramesValidation';
it('accepts single-angle overlays and rejects invalid frame contracts', () => {
  const frame = {
    time: 2,
    duration: 3,
    annotationPngPrimary: 'data:image/png;base64,aGVsbG8=',
    annotationPngSecondary: null,
  };
  expect(isExportFreezeFrames([frame], 10)).toBe(true);
  expect(isExportFreezeFrames(undefined, 10)).toBe(true);
  for (const patch of [
    { time: NaN },
    { time: -1 },
    { time: 11 },
    { duration: Infinity },
    { duration: 0 },
    { annotationPngPrimary: {} },
  ])
    expect(isExportFreezeFrames([{ ...frame, ...patch }], 10)).toBe(false);
});
