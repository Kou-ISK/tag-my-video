import { describe, expect, it } from 'vitest';
import type { ItemAnnotation } from '../../types/playlist/core';
import { validateTacticsAnnotation } from './annotationValidation';
const annotation: ItemAnnotation = {
  objects: [
    {
      id: 'a',
      type: 'line',
      color: '#fff',
      strokeWidth: 2,
      startX: 0,
      startY: 0,
      timestamp: 10,
      motion: {
        duration: 2,
        keyframes: [
          { time: 0, x: 0, y: 0 },
          { time: 2, x: 20, y: 10 },
        ],
      },
    },
  ],
  freezeDuration: 2,
  freezeAt: 0,
  chromaKey: { primary: { color: '#234567', similarity: 0.14, blend: 0.04 } },
  pitchCalibration: {
    secondary: {
      corners: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      widthMeters: 20,
      lengthMeters: 10,
    },
  },
};
describe('tactics persistence validation', () => {
  it('accepts a serialized extension without mutating it', () => {
    const restored: ItemAnnotation = JSON.parse(JSON.stringify(annotation));
    expect(() => validateTacticsAnnotation(restored)).not.toThrow();
    expect(restored).toEqual(annotation);
  });
  it('rejects duplicate keys and invalid plane or chroma rather than dropping data', () => {
    expect(() =>
      validateTacticsAnnotation({
        ...annotation,
        objects: [
          {
            ...annotation.objects[0],
            motion: {
              duration: 2,
              keyframes: [
                { time: 0, x: 0, y: 0 },
                { time: 0, x: 20, y: 10 },
              ],
            },
          },
        ],
      }),
    ).toThrow();
    expect(() =>
      validateTacticsAnnotation({
        ...annotation,
        pitchCalibration: {
          primary: { corners: [], widthMeters: 20, lengthMeters: 10 },
        },
      }),
    ).toThrow();
    expect(() =>
      validateTacticsAnnotation({
        ...annotation,
        chromaKey: { primary: { color: '#fff', similarity: 2, blend: 0 } },
      }),
    ).toThrow();
  });
});
