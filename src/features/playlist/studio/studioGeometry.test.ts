import { describe, expect, it } from 'vitest';
import { studioObjects } from '../fixtures/studio';
import { moveStudioLayer, resizeStudioObject } from './studioGeometry';
import {
  scaleObjectForDisplay,
  shiftObject,
} from '../components/annotationCanvasUtils';

describe('Studio geometry', () => {
  it('preserves source coordinates when scaling and moving a ring', () => {
    const source = studioObjects[1];
    const displayed = scaleObjectForDisplay(source, {
      width: 1600,
      height: 900,
      offsetX: 10,
      offsetY: 20,
    });
    expect(displayed.startX).toBe(source.startX * 2 + 10);
    expect(displayed.strokeWidth).toBe(source.strokeWidth * 2);
    const resized = resizeStudioObject(source, 140, 50);
    expect(resized.endX).toBe(source.startX + 140);
    expect(resized.endY).toBe(source.startY + 50);
    expect(shiftObject(resized, 10, 5)).toMatchObject({
      startX: source.startX + 10,
      startY: source.startY + 5,
    });
    expect(source.endX).toBe(307);
  });
  it('reorders only the requested layer without changing annotation data', () => {
    expect(
      moveStudioLayer(studioObjects, 'run', 1).map((object) => object.id),
    ).toEqual(['player', 'run', 'label']);
    expect(moveStudioLayer(studioObjects, 'run', -1)).toBe(studioObjects);
    expect(studioObjects[0].id).toBe('run');
  });
  it('resizes a region path around its top-left bounds', () => {
    const region = {
      ...studioObjects[0],
      type: 'polygon' as const,
      path: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 10, y: 40 },
      ],
    };
    expect(resizeStudioObject(region, 40, 60).path).toEqual([
      { x: 10, y: 20 },
      { x: 50, y: 80 },
      { x: 10, y: 80 },
    ]);
  });
});
