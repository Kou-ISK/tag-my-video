import type { GrayFrame, TrackPoint } from './templateTracker';
/** 芝など無地の中心に固執せず、対象の近くにある輪郭・模様を初期点とする。 */
export const findTrackingAnchor = (
  frame: GrayFrame,
  center: TrackPoint,
  radius: number,
  preferAbove: boolean,
): TrackPoint => {
  let best = center;
  let bestScore = 0;
  const span = Math.max(8, Math.min(40, radius));
  const top = preferAbove ? center.y - span * 2 : center.y - span;
  const bottom = preferAbove ? center.y : center.y + span;
  for (
    let y = Math.max(9, Math.round(top));
    y < Math.min(frame.height - 9, bottom);
    y += 2
  ) {
    for (
      let x = Math.max(9, Math.round(center.x - span));
      x < Math.min(frame.width - 9, center.x + span);
      x += 2
    ) {
      let xx = 0;
      let yy = 0;
      let xy = 0;
      for (let dy = -6; dy <= 6; dy += 2)
        for (let dx = -6; dx <= 6; dx += 2) {
          const i = (y + dy) * frame.width + x + dx;
          const gx = frame.pixels[i + 1] - frame.pixels[i - 1];
          const gy =
            frame.pixels[i + frame.width] - frame.pixels[i - frame.width];
          xx += gx * gx;
          yy += gy * gy;
          xy += gx * gy;
        }
      // 最小固有値で一本の白線より二方向の特徴を優先する。
      const corner = (xx + yy - Math.sqrt((xx - yy) ** 2 + 4 * xy * xy)) / 2;
      const score =
        corner / (1 + Math.hypot(x - center.x, y - center.y) / span);
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
  }
  return best;
};
