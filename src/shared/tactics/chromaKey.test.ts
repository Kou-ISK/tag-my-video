import { expect, it } from 'vitest';
import { extractGrassColor, maskAnnotationPixels } from './chromaKey';
it('extracts dominant grass color and preserves the foreground player silhouette', () => {
  const video = new Uint8ClampedArray([40, 100, 50, 255, 220, 30, 30, 255]);
  const drawing = new Uint8ClampedArray([255, 255, 0, 255, 255, 255, 0, 255]);
  maskAnnotationPixels(drawing, video, {
    color: '#286432',
    similarity: 0.1,
    blend: 0.04,
  });
  expect(drawing[3]).toBe(255);
  expect(drawing[7]).toBe(0);
  const samples = new Uint8ClampedArray(400);
  for (let i = 0; i < 400; i += 4) samples.set([40, 100, 50, 255], i);
  expect(extractGrassColor(samples)).toBe('#286432');
  expect(extractGrassColor(new Uint8ClampedArray(400).fill(255))).toBeNull();
});
