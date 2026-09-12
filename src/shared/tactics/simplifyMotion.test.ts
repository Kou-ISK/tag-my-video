import { describe, expect, it } from 'vitest';
import { simplifyMotion } from './simplifyMotion';
describe('tracking key reduction', () => {
  it('removes constant-velocity samples while retaining a change of direction', () => {
    const keys = [
      { time: 0, x: 0, y: 0 },
      { time: 1, x: 10, y: 0 },
      { time: 2, x: 20, y: 0 },
      { time: 3, x: 10, y: 0 },
      { time: 4, x: 0, y: 0 },
    ];
    expect(simplifyMotion(keys)).toEqual([keys[0], keys[2], keys[4]]);
  });
  it('retains a manual correction exceeding the interpolation tolerance', () => {
    const keys = [
      { time: 0, x: 0, y: 0 },
      { time: 1, x: 10, y: 4 },
      { time: 2, x: 20, y: 0 },
    ];
    expect(simplifyMotion(keys)).toEqual(keys);
  });
});
