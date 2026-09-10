export interface GrayFrame {
  width: number;
  height: number;
  pixels: Uint8Array;
}
export interface TrackPoint {
  x: number;
  y: number;
}
export interface TrackMatch extends TrackPoint {
  confidence: number;
  reliable: boolean;
}
const RADIUS = 8;
const vector = (frame: GrayFrame, x: number, y: number): number[] => {
  const values: number[] = [];
  for (let dy = -RADIUS; dy <= RADIUS; dy += 2)
    for (let dx = -RADIUS; dx <= RADIUS; dx += 2)
      values.push(
        frame.pixels[(Math.round(y) + dy) * frame.width + Math.round(x) + dx],
      );
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.map((value) => value - mean);
};
const inside = (frame: GrayFrame, x: number, y: number): boolean =>
  x >= RADIUS &&
  y >= RADIUS &&
  x < frame.width - RADIUS &&
  y < frame.height - RADIUS;
/** 画像の局所パターンを正規化相互相関で追跡する。低コントラスト/曖昧な一致は拒否。 */
export const matchTemplate = (
  reference: GrayFrame,
  at: TrackPoint,
  next: GrayFrame,
  searchRadius = 24,
): TrackMatch => {
  if (!inside(reference, at.x, at.y))
    return { ...at, confidence: 0, reliable: false };
  const template = vector(reference, at.x, at.y);
  const energy = template.reduce((sum, value) => sum + value * value, 0);
  if (energy / template.length < 64)
    return { ...at, confidence: 0, reliable: false };
  const candidates: TrackMatch[] = [];
  for (let y = Math.round(at.y - searchRadius); y <= at.y + searchRadius; y++)
    for (
      let x = Math.round(at.x - searchRadius);
      x <= at.x + searchRadius;
      x++
    ) {
      if (!inside(next, x, y)) continue;
      const candidate = vector(next, x, y);
      let cross = 0;
      let norm = 0;
      for (let i = 0; i < template.length; i++) {
        cross += template[i] * candidate[i];
        norm += candidate[i] ** 2;
      }
      const confidence = norm > 0 ? cross / Math.sqrt(energy * norm) : 0;
      candidates.push({ x, y, confidence, reliable: false });
    }
  candidates.sort((a, b) => b.confidence - a.confidence);
  const best = candidates[0];
  if (!best) return { ...at, confidence: 0, reliable: false };
  const rival = candidates.find(
    (candidate) => Math.hypot(candidate.x - best.x, candidate.y - best.y) > 8,
  );
  return {
    ...best,
    reliable:
      best.confidence >= 0.72 &&
      (!rival || best.confidence - rival.confidence > 0.04),
  };
};
