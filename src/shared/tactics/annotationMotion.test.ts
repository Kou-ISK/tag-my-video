import { describe, expect, it } from 'vitest';
import type { DrawingObject } from '../../types/playlist/core';
import {
  annotationAtTime,
  annotationOffsetAt,
  isAnnotationVisible,
  setAnnotationKeyframe,
} from './annotationMotion';
const object: DrawingObject = {
  id: 'disc',
  type: 'disc',
  startX: 100,
  startY: 200,
  endX: 160,
  endY: 220,
  baseWidth: 800,
  baseHeight: 450,
  timestamp: 10,
  color: '#ffffff',
  strokeWidth: 3,
  motion: {
    duration: 4,
    keyframes: [
      { time: 0, x: 0, y: 0 },
      { time: 4, x: 80, y: -40 },
    ],
  },
};
describe('timed annotation contract', () => {
  it('interpolates source-relative time without changing the stored geometry', () => {
    expect(annotationAtTime(object, 12)).toMatchObject({
      startX: 140,
      startY: 180,
      endX: 200,
      endY: 200,
    });
    expect(object.startX).toBe(100);
    expect(isAnnotationVisible(object, 9.99)).toBe(false);
    expect(isAnnotationVisible(object, 14)).toBe(true);
    expect(isAnnotationVisible(object, 14.01)).toBe(false);
    expect(isAnnotationVisible({ ...object, motion: undefined }, 10.05)).toBe(
      true,
    );
  });
  it('replaces a position at the same timestamp instead of creating duplicate keys', () => {
    const edited = setAnnotationKeyframe(
      setAnnotationKeyframe(object, 12, { x: 30, y: 10 }),
      12,
      { x: 50, y: 20 },
    );
    expect(edited.motion?.keyframes).toHaveLength(3);
    expect(annotationAtTime(edited, 12).startX).toBe(150);
  });
});

it('retains precise intermediate manual positions when a later tracking segment is inserted', () => {
  const corrected = setAnnotationKeyframe(object, 12, { x: 45, y: -18 });
  expect(corrected.motion?.keyframes[0].time).toBe(0);
  expect(annotationAtTime(corrected, 11).startX).toBeCloseTo(122.5);
});

it('records a held endpoint at the requested time without copying the old key time', () => {
  const held = {
    ...object,
    motion: {
      duration: 6,
      keyframes: [
        { time: 0, x: 0, y: 0 },
        { time: 4, x: 80, y: -40 },
      ],
    },
  };
  const offset = annotationOffsetAt(held, 15);
  expect(offset).toEqual({ x: 80, y: -40 });
  const updated = setAnnotationKeyframe(held, 15, offset);
  expect(updated.motion?.keyframes.at(-1)).toEqual({ time: 5, x: 80, y: -40 });
});
