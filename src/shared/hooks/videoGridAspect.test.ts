import { expect, it } from 'vitest';
import { videoGridAspect } from './videoGridAspect';
it('keeps one, two, three and four video layouts proportional', () => {
  expect(videoGridAspect([16 / 9])).toBeCloseTo(16 / 9);
  expect(videoGridAspect([16 / 9, 16 / 9])).toBeCloseTo(32 / 9);
  expect(videoGridAspect([16 / 9, 16 / 9, 16 / 9])).toBeCloseTo(16 / 9);
  expect(videoGridAspect([16 / 9, 16 / 9, 16 / 9, 16 / 9])).toBeCloseTo(16 / 9);
  expect(videoGridAspect([4 / 3, 4 / 3])).toBeCloseTo(8 / 3);
  expect(videoGridAspect([])).toBeCloseTo(16 / 9);
});
