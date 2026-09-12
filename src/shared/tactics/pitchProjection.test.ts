import { expect, it } from 'vitest';
import {
  imageToPitch,
  isValidPitchCalibration,
  pitchToImage,
} from './pitchProjection';
import type { PitchCalibration } from '../../types/playlist/core';
const calibration: PitchCalibration = {
  corners: [
    { x: 0.25, y: 0.2 },
    { x: 0.75, y: 0.25 },
    { x: 0.9, y: 0.9 },
    { x: 0.1, y: 0.8 },
  ],
  widthMeters: 70,
  lengthMeters: 100,
};
it('projects all four known corners and roundtrips interior field coordinates', () => {
  expect(isValidPitchCalibration(calibration)).toBe(true);
  expect(pitchToImage(calibration, { x: 0, y: 0 })?.x).toBeCloseTo(0.25);
  expect(pitchToImage(calibration, { x: 70, y: 100 })?.y).toBeCloseTo(0.9);
  for (const x of [0, 10, 35, 70])
    for (const y of [0, 20, 50, 100]) {
      const image = pitchToImage(calibration, { x, y });
      const field = image && imageToPitch(calibration, image);
      expect(field?.x).toBeCloseTo(x, 8);
      expect(field?.y).toBeCloseTo(y, 8);
    }
});
it('rejects crossing, collapsed, and invalid measurement planes', () => {
  expect(
    isValidPitchCalibration({
      ...calibration,
      corners: [
        calibration.corners[0],
        calibration.corners[2],
        calibration.corners[1],
        calibration.corners[3],
      ],
    }),
  ).toBe(false);
  expect(
    isValidPitchCalibration({
      ...calibration,
      corners: Array(4).fill({ x: 0.5, y: 0.5 }),
    }),
  ).toBe(false);
  expect(
    pitchToImage({ ...calibration, widthMeters: 0 }, { x: 2, y: 2 }),
  ).toBeNull();
});
