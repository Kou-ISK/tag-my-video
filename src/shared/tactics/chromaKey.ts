export interface ChromaKey {
  color: string;
  similarity: number;
  blend: number;
}
const channels = (hex: string): number[] =>
  [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16));
export const extractGrassColor = (pixels: Uint8ClampedArray): string | null => {
  const buckets = new Map<
    number,
    { count: number; r: number; g: number; b: number }
  >();
  for (let i = 0; i < pixels.length; i += 16) {
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    if (g < 35 || g < r * 1.15 || g < b * 1.15) continue;
    const key = (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4);
    const entry = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    entry.count++;
    entry.r += r;
    entry.g += g;
    entry.b += b;
    buckets.set(key, entry);
  }
  const best = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
  if (!best || best.count < (pixels.length / 16) * 0.01) return null;
  return (
    '#' +
    [best.r, best.g, best.b]
      .map((value) =>
        Math.round(value / best.count)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
};
/** FFmpeg colorkeyと同じRGB距離で描画のアルファを芝部分へ限定する。 */
export const maskAnnotationPixels = (
  annotation: Uint8ClampedArray,
  video: Uint8ClampedArray,
  key: ChromaKey,
): void => {
  const [r, g, b] = channels(key.color);
  for (let i = 0; i < annotation.length; i += 4) {
    if (!annotation[i + 3]) continue;
    const distance = Math.sqrt(
      ((video[i] - r) ** 2 +
        (video[i + 1] - g) ** 2 +
        (video[i + 2] - b) ** 2) /
        (3 * 255 ** 2),
    );
    const foregroundAlpha = Math.min(
      1,
      Math.max(0, (distance - key.similarity) / Math.max(0.0001, key.blend)),
    );
    annotation[i + 3] = Math.round(annotation[i + 3] * (1 - foregroundAlpha));
  }
};
