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
  switch (obj.type) {
    case 'polygon':
    case 'pen':
      return {
        ...obj,
        path: obj.path?.map(transformPoint),
        strokeWidth: obj.strokeWidth * ((scaleX + scaleY) / 2),
      };
    case 'line':
    case 'arrow':
    case 'rectangle':
    case 'ring':
    case 'spotlight':
    case 'circle':
      return {
        ...obj,
        startX: obj.startX * scaleX + target.offsetX,
        startY: obj.startY * scaleY + target.offsetY,
        endX:
          obj.endX !== undefined
            ? obj.endX * scaleX + target.offsetX
            : obj.endX,
        endY:
          obj.endY !== undefined
            ? obj.endY * scaleY + target.offsetY
            : obj.endY,
        strokeWidth: obj.strokeWidth * ((scaleX + scaleY) / 2),
      };
    case 'text':
      return {
        ...obj,
        startX: obj.startX * scaleX + target.offsetX,
        startY: obj.startY * scaleY + target.offsetY,
        fontSize: obj.fontSize ? obj.fontSize * ((scaleX + scaleY) / 2) : 24,
      };
    case 'select':
      return obj;
  }
};

export const getObjectBounds = (
  obj: DrawingObject,
): { minX: number; minY: number; maxX: number; maxY: number } | null => {
  switch (obj.type) {
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
  switch (obj.type) {
    case 'polygon':
    case 'pen':
      return {
        ...obj,
        path: obj.path?.map((p) => ({ x: p.x + dx, y: p.y + dy })),
      };
    case 'text':
      return {
        ...obj,
        startX: obj.startX + dx,
        startY: obj.startY + dy,
      };
    default:
      return {
        ...obj,
        startX: obj.startX + dx,
        startY: obj.startY + dy,
        endX: obj.endX !== undefined ? obj.endX + dx : obj.endX,
        endY: obj.endY !== undefined ? obj.endY + dy : obj.endY,
      };
    case 'select':
      return obj;
  }
};
