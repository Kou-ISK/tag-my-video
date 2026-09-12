import { describe, expect, it } from 'vitest';
import { matchTemplate } from './templateTracker';
import type { GrayFrame } from './templateTracker';
const frame = (dx: number, dy: number, duplicate = false): GrayFrame => {
  const pixels = new Uint8Array(120 * 90).fill(40);
  for (let y = -10; y <= 10; y++)
    for (let x = -10; x <= 10; x++) {
      const value = 70 + ((x * 79 + y * 113 + x * y * 17 + 30000) % 170);
      pixels[(40 + dy + y) * 120 + 50 + dx + x] = value;
      if (duplicate) pixels[(40 + dy + y) * 120 + 75 + x] = value;
    }
  return { width: 120, height: 90, pixels };
};
describe('local image tracking', () => {
  it('finds the translated visual pattern rather than repeating the starting position', () => {
    const match = matchTemplate(frame(0, 0), { x: 50, y: 40 }, frame(7, -5));
    expect(match).toMatchObject({ x: 57, y: 35, reliable: true });
    expect(match.confidence).toBeCloseTo(1);
  });
  it('stops on texture loss and ambiguous repeated objects', () => {
    const plain = {
      width: 120,
      height: 90,
      pixels: new Uint8Array(120 * 90).fill(40),
    };
    expect(matchTemplate(frame(0, 0), { x: 50, y: 40 }, plain).reliable).toBe(
      false,
    );
    expect(matchTemplate(plain, { x: 50, y: 40 }, plain).reliable).toBe(false);
    expect(
      matchTemplate(frame(0, 0), { x: 50, y: 40 }, frame(-5, 0, true), 30)
        .reliable,
    ).toBe(false);
  });
});
