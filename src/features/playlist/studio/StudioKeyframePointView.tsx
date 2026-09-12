import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { ButtonBase } from '@mui/material';
export const StudioKeyframePointView = ({
  time,
  localTime,
  left,
  selected,
  enabled,
  duration,
  zoom,
  onSelect,
  onMove,
}: {
  time: number;
  localTime: number;
  left: number;
  selected: boolean;
  enabled: boolean;
  duration: number;
  zoom: number;
  onSelect: () => void;
  onMove: (time: number) => void;
}): ReactElement => {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selected) {
      button.current?.focus({ preventScroll: true });
      button.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [selected, zoom]);
  const [offset, setOffset] = useState(0);
  const drag = useRef<{ x: number; width: number } | null>(null);
  const moved = useRef(false);
  const cancelDrag = (): void => {
    setOffset(0);
    drag.current = null;
    moved.current = true;
  };
  useEffect(() => {
    setOffset(0);
    drag.current = null;
    moved.current = true;
  }, [enabled, time]);
  return (
    <ButtonBase
      ref={button}
      aria-label={`${time.toFixed(2)}秒のキーフレーム`}
      aria-pressed={selected}
      onFocus={onSelect}
      onClick={() => {
        if (!moved.current) onSelect();
        moved.current = false;
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.stopPropagation();
        onSelect();
        event.currentTarget.focus();
        moved.current = false;
        if (!enabled || localTime === 0) return;
        drag.current = {
          x: event.clientX,
          width:
            event.currentTarget.parentElement?.getBoundingClientRect().width ??
            1,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (drag.current && Math.abs(event.clientX - drag.current.x) > 3) {
          moved.current = true;
          setOffset(event.clientX - drag.current.x);
        }
      }}
      onPointerUp={(event) => {
        setOffset(0);
        const start = drag.current;
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
        if (start && moved.current)
          onMove(
            time +
              ((event.clientX - start.x) / Math.max(1, start.width)) * duration,
          );
      }}
      onPointerCancel={cancelDrag}
      onBlur={cancelDrag}
      onLostPointerCapture={() => {
        setOffset(0);
        drag.current = null;
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && drag.current) {
          event.preventDefault();
          event.stopPropagation();
          cancelDrag();
          return;
        }
        if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          if (enabled)
            onMove(
              time +
                ((event.key === 'ArrowLeft' ? -1 : 1) *
                  (event.shiftKey ? 10 : 1)) /
                  30,
            );
        }
      }}
      sx={{
        position: 'absolute',
        transform: `translateX(${offset}px)`,
        left: `calc(${left}% - 12px)`,
        top: 1,
        width: 24,
        height: 24,
        touchAction: 'none',
        cursor: enabled && localTime > 0 ? 'ew-resize' : 'pointer',
        '&::after': {
          content: '""',
          width: selected ? 11 : 8,
          height: selected ? 11 : 8,
          transform: 'rotate(45deg)',
          bgcolor: selected ? 'primary.main' : 'background.paper',
          border: 1,
          borderColor: selected ? 'primary.contrastText' : 'text.primary',
        },
        '&.Mui-focusVisible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2,
        },
      }}
    />
  );
};
