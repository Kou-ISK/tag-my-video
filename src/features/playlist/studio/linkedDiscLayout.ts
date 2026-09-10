import type { DrawingObject } from '../../../types/playlist/core';

type Point = { x: number; y: number };
export const PLAYER_COUNTS = Array.from(
  { length: 14 },
  (_, index) => index + 2,
);

/** 既存選手の位置を動かさず、長い区間の中点へ新しい選手を追加する。 */
export const resizeLinkedDiscPath = (
  object: DrawingObject,
  count: number,
): Point[] => {
  const path = [...(object.path ?? [])];
  if (!PLAYER_COUNTS.includes(count) || path.length < 2) return path;
  while (path.length < count) {
    let segment = 0;
    let distance = -1;
    for (let i = 0; i < path.length - 1; i++) {
      const length = Math.hypot(
        path[i + 1].x - path[i].x,
        path[i + 1].y - path[i].y,
      );
      if (length > distance) {
        distance = length;
        segment = i;
      }
    }
    const a = path[segment],
      b = path[segment + 1];
    path.splice(segment + 1, 0, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  return path.slice(0, count);
};
