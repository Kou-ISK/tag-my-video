import type { ClipExportMotionOverlay } from '../../../src/shared/clipExport/clipExportTypes';
export type ExportMotionOverlay = Omit<ClipExportMotionOverlay, 'png'> & {
  image: string;
};

const expression = (
  frames: ExportMotionOverlay['keyframes'],
  axis: 'x' | 'y',
  start: number,
): string => {
  const number = (value: number): string => value.toString();
  let result = number(frames[frames.length - 1][axis]);
  for (let i = frames.length - 2; i >= 0; i--) {
    const a = frames[i];
    const b = frames[i + 1];
    const delta = b[axis] - a[axis];
    const segment = `${number(a[axis])}+${number(delta)}*clip((t-${number(start + a.time)})/${number(b.time - a.time)},0,1)`;
    result = `if(lt(t,${number(start + b.time)}),${segment},${result})`;
  }
  return result;
};

/** 元映像時刻で合成し、その後に静止フレームを挿入する。 */
export const overlayMotion = (
  filters: string[],
  inputs: string[],
  label: string,
  overlays: ExportMotionOverlay[],
  target: 'primary' | 'secondary',
  inputIndex: number,
): { label: string; inputIndex: number } => {
  let result = label;
  let next = inputIndex;
  for (const overlay of overlays.filter((entry) => entry.target === target)) {
    const prefix = `motion${next}`;
    inputs.push('-i', overlay.image);
    filters.push(`[${next}:v]format=rgba[${prefix}raw]`);
    filters.push(
      `[${prefix}raw]${result}scale2ref[${prefix}scaled][${prefix}base]`,
    );
    const x = `(${expression(overlay.keyframes, 'x', overlay.start)})*main_w/${overlay.baseWidth}`;
    const y = `(${expression(overlay.keyframes, 'y', overlay.start)})*main_h/${overlay.baseHeight}`;
    filters.push(
      `[${prefix}base][${prefix}scaled]overlay=x='${x}':y='${y}':eval=frame:enable='between(t,${overlay.start},${overlay.end})'[${prefix}out]`,
    );
    result = `[${prefix}out]`;
    next++;
  }
  return { label: result, inputIndex: next };
};
