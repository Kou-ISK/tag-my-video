import { matchTemplate } from './templateTracker';
import type { GrayFrame, TrackPoint } from './templateTracker';
export interface FeatureMotion {
  points: TrackPoint[];
  dx: number;
  dy: number;
  confidence: number;
  reliable: boolean;
}
/** 複数の局所特徴を往復照合し、同じ移動を支持する点だけで変位を求める。 */
export const trackFeatures = (
  before: GrayFrame,
  after: GrayFrame,
  points: readonly TrackPoint[],
  prediction: TrackPoint = { x: 0, y: 0 },
): FeatureMotion => {
  if (
    before.width === after.width &&
    before.height === after.height &&
    before.pixels.every((value, index) => value === after.pixels[index])
  ) {
    return {
      points: [...points],
      dx: 0,
      dy: 0,
      confidence: 1,
      reliable: points.length >= 2,
    };
  }
  const matches = points.flatMap((point, index) =>
    [4, 8].flatMap((patchRadius) => {
      const next = matchTemplate(
        before,
        point,
        after,
        24,
        patchRadius,
        { x: point.x + prediction.x, y: point.y + prediction.y },
        0.65,
      );
      if (next.confidence < 0.65) return [];
      const reverse = matchTemplate(
        after,
        next,
        before,
        8,
        patchRadius,
        point,
        0.65,
      );
      if (
        reverse.confidence < 0.65 ||
        Math.hypot(reverse.x - point.x, reverse.y - point.y) > 2
      )
        return [];
      return [
        {
          index,
          point: { x: next.x, y: next.y },
          dx: next.x - point.x,
          dy: next.y - point.y,
          confidence: next.confidence,
        },
      ];
    }),
  );
  let inliers: typeof matches = [];
  for (const seed of matches) {
    const unique = new Map<number, (typeof matches)[number]>();
    for (const match of matches) {
      if (Math.hypot(match.dx - seed.dx, match.dy - seed.dy) > 2.5) continue;
      if ((unique.get(match.index)?.confidence ?? 0) < match.confidence)
        unique.set(match.index, match);
    }
    const group = [...unique.values()];
    if (group.length > inliers.length) inliers = group;
  }
  const median = (values: number[]): number => {
    values.sort((a, b) => a - b);
    return values.length ? values[Math.floor(values.length / 2)] : 0;
  };
  return {
    points: inliers.map((match) => match.point),
    dx: median(inliers.map((match) => match.dx)),
    dy: median(inliers.map((match) => match.dy)),
    confidence: inliers.length
      ? Math.min(...inliers.map((match) => match.confidence))
      : 0,
    reliable:
      inliers.length >= 2 &&
      inliers.length >= new Set(matches.map((match) => match.index)).size * 0.5,
  };
};
