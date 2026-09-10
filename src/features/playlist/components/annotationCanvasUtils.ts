import { getCurveControl } from './tacticalGeometry';
import type { DrawingObject } from '../../../types/playlist/core';

export const generateAnnotationId = (): string =>
  Math.random().toString(36).substring(2, 11);

export { renderObject } from './annotationDrawing';

export const scaleObjectForDisplay = (
  obj: DrawingObject,
  target: { width: number; height: number; offsetX: number; offsetY: number },
): DrawingObject => {
  const scaleX = target.width / (obj.baseWidth ?? target.width);
  const scaleY = target.height / (obj.baseHeight ?? target.height);
  const transformPoint = (p: { x: number; y: number }) => ({
    x: p.x * scaleX + target.offsetX,
    y: p.y * scaleY + target.offsetY,
  });
  return {
    ...obj,
    startX: obj.startX * scaleX + target.offsetX,
    startY: obj.startY * scaleY + target.offsetY,
    endX:
      obj.endX === undefined ? undefined : obj.endX * scaleX + target.offsetX,
    endY:
      obj.endY === undefined ? undefined : obj.endY * scaleY + target.offsetY,
    path: obj.path?.map(transformPoint),
    strokeWidth: obj.strokeWidth * ((scaleX + scaleY) / 2),
    fontSize: (obj.fontSize ?? 24) * ((scaleX + scaleY) / 2),
    discRadius: (obj.discRadius ?? 22) * ((scaleX + scaleY) / 2),
  };
};

export const getObjectBounds = (
  obj: DrawingObject,
): { minX: number; minY: number; maxX: number; maxY: number } | null => {
  switch (obj.type) {
    case 'linkedDiscs':
    case 'polygon':
    case 'pen': {
      if (!obj.path || obj.path.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      }
      const xs = obj.path.map((p) => p.x);
      const ys = obj.path.map((p) => p.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    case 'curvedArrow': {
      const endX = obj.endX ?? obj.startX;
      const endY = obj.endY ?? obj.startY;
      const { x: cx, y: cy } = getCurveControl(obj);
      const extent = (
        start: number,
        control: number,
        end: number,
      ): number[] => {
        const denominator = start - 2 * control + end;
        const t = denominator === 0 ? -1 : (start - control) / denominator;
        return t > 0 && t < 1
          ? [
              start,
              end,
              (1 - t) ** 2 * start + 2 * (1 - t) * t * control + t ** 2 * end,
            ]
          : [start, end];
      };
      const xs = extent(obj.startX, cx, endX);
      const ys = extent(obj.startY, cy, endY);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    case 'beam':
    case 'disc':
    case 'line':
    case 'arrow':
    case 'rectangle':
    case 'ring':
    case 'spotlight':
    case 'circle': {
      const minX = Math.min(obj.startX, obj.endX ?? obj.startX);
      const minY = Math.min(obj.startY, obj.endY ?? obj.startY);
      const maxX = Math.max(obj.startX, obj.endX ?? obj.startX);
      const maxY = Math.max(obj.startY, obj.endY ?? obj.startY);
      return { minX, minY, maxX, maxY };
    }
    case 'text':
      return {
        minX: obj.startX,
        minY: obj.startY - (obj.fontSize || 24),
        maxX:
          obj.startX +
          Array.from(obj.text || ' ').reduce(
            (width, character) =>
              width +
              ((character.codePointAt(0) ?? 0) > 0xff ? 1 : 0.6) *
                (obj.fontSize || 24),
            0,
          ),
        maxY: obj.startY,
      };
    case 'select':
      return null;
  }
};

const pointInBounds = (
  x: number,
  y: number,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  tolerance = 0,
) =>
  x >= bounds.minX - tolerance &&
  x <= bounds.maxX + tolerance &&
  y >= bounds.minY - tolerance &&
  y <= bounds.maxY + tolerance;

export const findObjectAtPoint = (
  objects: DrawingObject[],
  x: number,
  y: number,
  tolerance: number,
) => {
  for (let i = objects.length - 1; i >= 0; i -= 1) {
    const obj = objects[i];
    const bounds = getObjectBounds(obj);
    if (!bounds) continue;
    if (pointInBounds(x, y, bounds, tolerance)) return obj;
  }
  return null;
};

export const shiftObject = (
  obj: DrawingObject,
  dx: number,
  dy: number,
): DrawingObject => {
  return {
    ...obj,
    startX: obj.startX + dx,
    startY: obj.startY + dy,
    endX: obj.endX === undefined ? undefined : obj.endX + dx,
    endY: obj.endY === undefined ? undefined : obj.endY + dy,
    path: obj.path?.map((point) => ({ x: point.x + dx, y: point.y + dy })),
  };
};
