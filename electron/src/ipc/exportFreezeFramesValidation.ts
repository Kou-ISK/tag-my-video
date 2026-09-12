import { isPlainObject } from './ipcPayloadGuards';
const isNullableImage = (value: unknown): boolean =>
  value == null || typeof value === 'string';
export const isExportFreezeFrames = (
  value: unknown,
  clipDuration: number,
): boolean =>
  value === undefined ||
  (Array.isArray(value) &&
    value.every(
      (frame: unknown) =>
        isPlainObject(frame) &&
        typeof frame.time === 'number' &&
        Number.isFinite(frame.time) &&
        frame.time >= 0 &&
        frame.time <= clipDuration &&
        typeof frame.duration === 'number' &&
        Number.isFinite(frame.duration) &&
        frame.duration > 0 &&
        frame.duration <= 60 &&
        isNullableImage(frame.annotationPngPrimary) &&
        isNullableImage(frame.annotationPngSecondary),
    ));
