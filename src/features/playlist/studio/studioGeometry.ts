import type { DrawingObject } from '../../../types/playlist/core';
import { getObjectBounds } from '../components/annotationCanvasUtils';

export const resizeStudioObject = (
  object: DrawingObject,
  width: number,
  height: number,
): DrawingObject => {
  const bounds = getObjectBounds(object);
  if (!bounds) return object;
  const scaleX = Math.max(4, width) / Math.max(1, bounds.maxX - bounds.minX);
  const scaleY = Math.max(4, height) / Math.max(1, bounds.maxY - bounds.minY);
  const x = (value: number): number =>
    bounds.minX + (value - bounds.minX) * scaleX;
  const y = (value: number): number =>
    bounds.minY + (value - bounds.minY) * scaleY;
  return {
    ...object,
    startX: x(object.startX),
    startY: y(object.startY),
    endX: object.endX === undefined ? undefined : x(object.endX),
    endY: object.endY === undefined ? undefined : y(object.endY),
    path: object.path?.map((point) => ({ x: x(point.x), y: y(point.y) })),
    fontSize:
      object.type === 'text'
        ? (object.fontSize ?? 24) * scaleY
        : object.fontSize,
  };
};

export const moveStudioLayer = (
  objects: DrawingObject[],
  id: string,
  direction: -1 | 1,
): DrawingObject[] => {
  const index = objects.findIndex((object) => object.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= objects.length) return objects;
  const result = [...objects];
  [result[index], result[nextIndex]] = [result[nextIndex], result[index]];
  return result;
};

export const STUDIO_TOOLS = [
  { id: 'select', label: '選択・移動' },
  { id: 'arrow', label: '矢印' },
  { id: 'line', label: 'ライン' },
  { id: 'pen', label: 'ペン' },
  { id: 'rectangle', label: '矩形' },
  { id: 'circle', label: '楕円' },
  { id: 'ring', label: '選手リング' },
  { id: 'spotlight', label: 'スポットライト' },
  { id: 'polygon', label: '領域' },
  { id: 'text', label: 'テキスト' },
] as const;
