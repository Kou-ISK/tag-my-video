import type {
  DrawingObject,
  AnnotationTarget,
} from '../../../types/playlist/core';
import type { ClipExportMotionOverlay } from '../../../shared/clipExport/clipExportTypes';

export const buildMotionOverlays = (
  objects: DrawingObject[],
  sourceStart: number,
  duration: number,
  render: (objects: DrawingObject[], target: AnnotationTarget) => string | null,
): ClipExportMotionOverlay[] => {
  if (
    objects.length > 64 ||
    objects.reduce(
      (total, object) => total + (object.motion?.keyframes.length ?? 1),
      0,
    ) > 4096
  )
    throw new Error(
      '動き・芝色処理を含む書き出しは、1クリップ64図形・合計4096位置までです。クリップを分けてください。',
    );
  return objects.flatMap((object) => {
    const target = object.target ?? 'primary';
    const png = render([object], target);
    if (!png) return [];
    const start = object.timestamp - sourceStart;
    return [
      {
        start: object.motion ? start : Math.max(0, start - 0.12),
        end: Math.min(duration, start + (object.motion?.duration ?? 0.12)),
        baseWidth: object.baseWidth ?? 1920,
        baseHeight: object.baseHeight ?? 1080,
        keyframes: object.motion?.keyframes ?? [{ time: 0, x: 0, y: 0 }],
        target,
        png,
      },
    ];
  });
};
