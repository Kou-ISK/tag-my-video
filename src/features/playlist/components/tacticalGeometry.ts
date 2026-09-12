import type { DrawingObject } from '../../../types/playlist/core';

/** 非等方リサイズ後も曲線の制御点を保持する。 */
export const getCurveControl = (
  object: DrawingObject,
): { x: number; y: number } => {
  if (object.path?.[0]) return object.path[0];
  const endX = object.endX ?? object.startX;
  const endY = object.endY ?? object.startY;
  const bend = object.curvature ?? -0.25;
  return {
    x: (object.startX + endX) / 2 - (endY - object.startY) * bend,
    y: (object.startY + endY) / 2 + (endX - object.startX) * bend,
  };
};
