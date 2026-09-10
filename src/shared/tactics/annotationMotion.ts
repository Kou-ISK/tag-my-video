import type { DrawingObject, DrawingKeyframe } from '../../types/playlist/core';

export const isAnnotationVisible = (
  object: DrawingObject,
  time: number,
  tolerance = 0.12,
): boolean =>
  object.motion
    ? time >= object.timestamp &&
      time <= object.timestamp + object.motion.duration
    : Math.abs(object.timestamp - time) <= tolerance;

export const annotationOffsetAt = (
  object: DrawingObject,
  time: number,
): { x: number; y: number } => {
  const frames = object.motion?.keyframes;
  if (!frames?.length) return { x: 0, y: 0 };
  const local = time - object.timestamp;
  if (local <= frames[0].time) return { x: frames[0].x, y: frames[0].y };
  for (let i = 1; i < frames.length; i++) {
    if (local <= frames[i].time) {
      const a = frames[i - 1];
      const b = frames[i];
      const ratio = (local - a.time) / Math.max(0.000001, b.time - a.time);
      return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio };
    }
  }
  const last = frames[frames.length - 1];
  return { x: last.x, y: last.y };
};

export const annotationAtTime = (
  object: DrawingObject,
  time: number,
): DrawingObject => {
  const { x, y } = annotationOffsetAt(object, time);
  return {
    ...object,
    startX: object.startX + x,
    startY: object.startY + y,
    endX: object.endX === undefined ? undefined : object.endX + x,
    endY: object.endY === undefined ? undefined : object.endY + y,
    path: object.path?.map((point) => ({ x: point.x + x, y: point.y + y })),
  };
};

export const setAnnotationKeyframe = (
  object: DrawingObject,
  time: number,
  offset: { x: number; y: number },
): DrawingObject => {
  if (!object.motion) return object;
  const local = Math.max(
    0,
    Math.min(object.motion.duration, time - object.timestamp),
  );
  const frames = object.motion.keyframes.filter(
    (frame) => Math.abs(frame.time - local) > 0.001,
  );
  if (frames.length >= 256) return object;
  const keyframe: DrawingKeyframe = { time: local, ...offset };
  return {
    ...object,
    motion: {
      ...object.motion,
      keyframes: [...frames, keyframe].sort((a, b) => a.time - b.time),
    },
  };
};
