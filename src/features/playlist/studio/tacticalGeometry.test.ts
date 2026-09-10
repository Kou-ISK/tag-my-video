import { describe, expect, it } from 'vitest';
import type { DrawingObject } from '../../../types/playlist/core';
import {
  getObjectBounds,
  scaleObjectForDisplay,
  shiftObject,
} from '../components/annotationCanvasUtils';
import { resizeStudioObject } from './studioGeometry';
const link: DrawingObject = {
  id: 'link',
  type: 'linkedDiscs',
  startX: 100,
  startY: 100,
  endX: 300,
  endY: 200,
  path: [
    { x: 100, y: 100 },
    { x: 200, y: 120 },
    { x: 300, y: 200 },
  ],
  discRadius: 20,
  strokeWidth: 4,
  color: '#ffffff',
  timestamp: 12,
  target: 'secondary',
  baseWidth: 800,
  baseHeight: 450,
};
describe('tactical graphics coordinate contract', () => {
  it('scales every player and disc identically for letterboxed display and export', () => {
    const display = scaleObjectForDisplay(link, {
      width: 1600,
      height: 900,
      offsetX: 40,
      offsetY: 30,
    });
    expect(display.path).toEqual([
      { x: 240, y: 230 },
      { x: 440, y: 270 },
      { x: 640, y: 430 },
    ]);
    expect(display.discRadius).toBe(40);
    expect(display.strokeWidth).toBe(8);
    expect(display.startX).toBe(240);
    expect(display.target).toBe('secondary');
    expect(display.timestamp).toBe(12);
    expect(link.path?.[0]).toEqual({ x: 100, y: 100 });
  });
  it('moves and resizes a formation without losing the individual player positions', () => {
    const shifted = shiftObject(link, 30, -20);
    expect(shifted.path?.[1]).toEqual({ x: 230, y: 100 });
    const resized = resizeStudioObject(shifted, 400, 200);
    expect(resized.path).toEqual([
      { x: 130, y: 80 },
      { x: 330, y: 120 },
      { x: 530, y: 280 },
    ]);
  });
});

it('resizes a curved arrow with independent horizontal and vertical scales', () => {
  const curve: DrawingObject = {
    ...link,
    type: 'curvedArrow',
    path: undefined,
    startX: 100,
    startY: 100,
    endX: 300,
    endY: 100,
    curvature: 0.5,
  };
  const resized = resizeStudioObject(curve, 400, 150);
  expect(getObjectBounds(resized)).toEqual({
    minX: 100,
    minY: 100,
    maxX: 500,
    maxY: 250,
  });
  expect(resized.path).toEqual([{ x: 300, y: 400 }]);
});
