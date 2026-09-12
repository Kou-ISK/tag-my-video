import type { GrayFrame } from './templateTracker';
/** 2×2平均でノイズを抑えながら、急移動を広い範囲で探索する。 */
export const halfFrame = (frame: GrayFrame): GrayFrame => {
  const width = Math.floor(frame.width / 2),
    height = Math.floor(frame.height / 2);
  const pixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = y * 2 * frame.width + x * 2;
      pixels[y * width + x] = Math.round(
        (frame.pixels[i] +
          frame.pixels[i + 1] +
          frame.pixels[i + frame.width] +
          frame.pixels[i + frame.width + 1]) /
          4,
      );
    }
  return { width, height, pixels };
};
