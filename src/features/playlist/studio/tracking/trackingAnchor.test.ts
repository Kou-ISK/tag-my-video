import { describe, expect, it } from 'vitest';
import { findTrackingAnchors } from './trackingAnchor';
import { matchTemplate } from './templateTracker';
import type { GrayFrame } from './templateTracker';
const frame = (dx = 0): GrayFrame => {
  const pixels = new Uint8Array(120 * 100).fill(40);
  for (let y = 35; y < 58; y++)
    for (let x = 44; x < 64; x++) {
      pixels[y * 120 + x + dx] = 60 + ((x * 79 + y * 113 + x * y * 17) % 170);
    }
  return { width: 120, height: 100, pixels };
};
describe('tracking anchor', () => {
  it('tracks the shirt above a plain foot marker instead of rejecting grass', () => {
    const start = frame();
    expect(matchTemplate(start, { x: 54, y: 78 }, frame(7)).reliable).toBe(
      false,
    );
    const point = findTrackingAnchors(start, { x: 54, y: 78 }, 22, true)[0];
    expect(point.y).toBeLessThan(60);
    expect(matchTemplate(start, point, frame(7))).toMatchObject({
      x: point.x + 7,
      y: point.y,
      reliable: true,
    });
  });
  it('does not fabricate a track on blank video or outside the image', () => {
    const blank = { width: 120, height: 100, pixels: new Uint8Array(12000) };
    expect(findTrackingAnchors(blank, { x: 2, y: 2 }, 22, true)).toEqual([]);
  });
});
