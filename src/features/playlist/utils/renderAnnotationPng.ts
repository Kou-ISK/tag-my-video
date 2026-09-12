import type {
  AnnotationTarget,
  DrawingObject,
} from '../../../types/playlist/core';
import {
  renderObject,
  scaleObjectForDisplay,
} from '../components/annotationCanvasUtils';
interface Size {
  width: number;
  height: number;
}

/** Canvasとexportで同じ描画器・各object固有の基準寸法を使用する。 */
export const renderAnnotationPng = (
  objects: DrawingObject[] | undefined,
  target: AnnotationTarget,
  fallbackSize: Size,
  targetSize?: Size,
): string | null => {
  const filtered =
    objects?.filter((object) => (object.target ?? 'primary') === target) ?? [];
  if (filtered.length === 0) return null;
  const width =
    targetSize?.width || fallbackSize.width || filtered[0].baseWidth || 1920;
  const height =
    targetSize?.height || fallbackSize.height || filtered[0].baseHeight || 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;
  filtered.forEach((object) =>
    renderObject(
      context,
      scaleObjectForDisplay(object, { width, height, offsetX: 0, offsetY: 0 }),
    ),
  );
  return canvas.toDataURL('image/png');
};
