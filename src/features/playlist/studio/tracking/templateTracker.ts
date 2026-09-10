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
const vector = (
  frame: GrayFrame,
  x: number,
  y: number,
  radius: number,
): number[] => {
  const values: number[] = [];
  const stride = radius >= 8 ? 2 : 1;
  for (let dy = -radius; dy <= radius; dy += stride)
    for (let dx = -radius; dx <= radius; dx += stride)
      values.push(
        frame.pixels[(Math.round(y) + dy) * frame.width + Math.round(x) + dx],
      );
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.map((value) => value - mean);
};
const inside = (
  frame: GrayFrame,
  x: number,
  y: number,
  radius: number,
): boolean =>
  x >= radius &&
  y >= radius &&
  x < frame.width - radius &&
  y < frame.height - radius;
/** 画像の局所パターンを正規化相互相関で追跡する。低コントラスト/曖昧な一致は拒否。 */
export const matchTemplate = (
  reference: GrayFrame,
  at: TrackPoint,
  next: GrayFrame,
  searchRadius = 24,
  patchRadius = 8,
  searchCenter: TrackPoint = at,
  minimumConfidence = 0.72,
): TrackMatch => {
  if (!inside(reference, at.x, at.y, patchRadius))
    return { ...at, confidence: 0, reliable: false };
  const template = vector(reference, at.x, at.y, patchRadius);
  const energy = template.reduce((sum, value) => sum + value * value, 0);
  if (energy / template.length < 25)
    return { ...at, confidence: 0, reliable: false };
  const candidates: TrackMatch[] = [];
  for (
    let y = Math.round(searchCenter.y - searchRadius);
    y <= searchCenter.y + searchRadius;
    y++
  )
    for (
      let x = Math.round(searchCenter.x - searchRadius);
      x <= searchCenter.x + searchRadius;
      x++
    ) {
      if (!inside(next, x, y, patchRadius)) continue;
      const candidate = vector(next, x, y, patchRadius);
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
      best.confidence >= minimumConfidence &&
      (!rival || best.confidence - rival.confidence > 0.04),
  };
};
