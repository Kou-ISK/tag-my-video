import type { GrayFrame, TrackPoint } from './templateTracker';
export interface TrackingRegion {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
/** 芝など無地の中心に固執せず、対象の近くにある輪郭・模様を初期点とする。 */
export const findTrackingAnchors = (
  frame: GrayFrame,
  center: TrackPoint,
  radius: number,
  preferAbove: boolean,
  region?: TrackingRegion,
): TrackPoint[] => {
  const candidates: Array<TrackPoint & { score: number }> = [];
  const span = Math.max(8, Math.min(40, radius));
  const top =
    region?.minY ?? (preferAbove ? center.y - span * 4 : center.y - span);
  const bottom =
    region?.maxY ?? (preferAbove ? center.y - span : center.y + span);
  const focusY = preferAbove ? center.y - span * 3 : center.y;
  for (
    let y = Math.max(9, Math.round(top));
    y < Math.min(frame.height - 9, bottom);
    y += 2
  ) {
    for (
      let x = Math.max(9, Math.round(region?.minX ?? center.x - span));
      x < Math.min(frame.width - 9, region?.maxX ?? center.x + span);
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
      const score = corner / (1 + Math.hypot(x - center.x, y - focusY) / span);
      if (score > 100) candidates.push({ x, y, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const points: TrackPoint[] = [];
  for (const point of candidates) {
    if (
      points.every(
        (other) => Math.hypot(other.x - point.x, other.y - point.y) >= 5,
      )
    )
      points.push({ x: point.x, y: point.y });
    if (points.length >= 10) break;
  }
  return points;
};
