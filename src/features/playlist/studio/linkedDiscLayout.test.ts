import { expect, it } from 'vitest';
import { createLinkedDiscPath, resizeLinkedDiscPath } from './linkedDiscLayout';
import type { DrawingObject } from '../../../types/playlist/core';
it('creates the requested player count including both drag endpoints', () => {
  const points = createLinkedDiscPath({ x: 10, y: 20 }, { x: 110, y: 70 }, 6);
  expect(points).toHaveLength(6);
  expect(points[0]).toEqual({ x: 10, y: 20 });
  expect(points[5]).toEqual({ x: 110, y: 70 });
});
it('adds players between existing positions without moving them or leaving the frame', () => {
  const object: DrawingObject = {
    id: 'link',
    type: 'linkedDiscs',
    startX: 0,
    startY: 0,
    color: '#ffffff',
    strokeWidth: 3,
    timestamp: 0,
    baseWidth: 800,
    baseHeight: 450,
    path: [
      { x: 750, y: 400 },
      { x: 790, y: 420 },
    ],
  };
  const points = resizeLinkedDiscPath(object, 5);
  expect(points).toHaveLength(5);
  expect(points).toEqual(expect.arrayContaining(object.path ?? []));
  expect(points.every((point) => point.x <= 790 && point.y <= 420)).toBe(true);
  expect(object.path).toHaveLength(2);
});
