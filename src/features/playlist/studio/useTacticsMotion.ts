import type { DrawingObject } from '../../../types/playlist/core';
import {
  annotationOffsetAt,
  setAnnotationKeyframe,
} from '../../../shared/tactics/annotationMotion';
export interface TacticsMotionProps {
  selected: DrawingObject | null;
  time: number;
  maxTime: number;
  onMotionToggle: (enabled: boolean) => void;
  onDurationChange: (duration: number) => void;
  onAddKeyframe: () => void;
}
export const useTacticsMotion = (
  selected: DrawingObject | null,
  time: number,
  maxTime: number,
  update: (patch: Partial<DrawingObject>) => void,
): TacticsMotionProps => ({
  selected,
  time,
  maxTime,
  onMotionToggle: (enabled) =>
    update({
      motion:
        enabled && selected
          ? {
              duration: Math.min(
                3,
                Math.max(0.1, maxTime - selected.timestamp),
              ),
              keyframes: [{ time: 0, x: 0, y: 0 }],
            }
          : undefined,
    }),
  onDurationChange: (duration) => {
    if (
      !selected?.motion ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      duration > 600 ||
      duration > maxTime - selected.timestamp
    )
      return;
    const offset = annotationOffsetAt(selected, selected.timestamp + duration);
    const next = {
      ...selected,
      motion: {
        duration,
        keyframes: selected.motion.keyframes.filter(
          (key) => key.time <= duration,
        ),
      },
    };
    update(setAnnotationKeyframe(next, selected.timestamp + duration, offset));
  },
  onAddKeyframe: () => {
    if (selected?.motion)
      update(
        setAnnotationKeyframe(
          selected,
          time,
          annotationOffsetAt(selected, time),
        ),
      );
  },
});
