import { useCallback } from 'react';
import type { PointerEvent } from 'react';

export const useTimelineSeek = (
  clientXToContentX: (x: number) => number,
  positionToTime: (x: number) => number,
  onSeek: (time: number) => void,
): {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
} => {
  const seek = useCallback(
    (event: PointerEvent<HTMLElement>): void => {
      event.stopPropagation();
      onSeek(positionToTime(clientXToContentX(event.clientX)));
    },
    [clientXToContentX, positionToTime, onSeek],
  );
  return {
    onPointerDown: (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      seek(event);
    },
    onPointerMove: (event) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) seek(event);
    },
    onPointerUp: (event) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      seek(event);
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
  };
};
