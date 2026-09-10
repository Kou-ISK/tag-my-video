import type { DrawingKeyframe } from '../../types/playlist/core';
/** 時間補間に対する位置誤差を制限して追跡点を間引く。 */
export const simplifyMotion = (
  keys: DrawingKeyframe[],
  tolerance = 1,
): DrawingKeyframe[] => {
  if (keys.length <= 2) return keys;
  const first = keys[0];
  const last = keys[keys.length - 1];
  let farthest = -1;
  let distance = tolerance;
  for (let i = 1; i < keys.length - 1; i++) {
    const ratio =
      (keys[i].time - first.time) / Math.max(1e-9, last.time - first.time);
    const error = Math.hypot(
      keys[i].x - first.x - (last.x - first.x) * ratio,
      keys[i].y - first.y - (last.y - first.y) * ratio,
    );
    if (error > distance) {
      distance = error;
      farthest = i;
    }
  }
  if (farthest < 0) return [first, last];
  return [
    ...simplifyMotion(keys.slice(0, farthest + 1), tolerance).slice(0, -1),
    ...simplifyMotion(keys.slice(farthest), tolerance),
  ];
};
