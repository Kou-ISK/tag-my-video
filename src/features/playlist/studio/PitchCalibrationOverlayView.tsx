import type { ReactElement, PointerEvent } from 'react';
import { useTheme } from '@mui/material';
import type { PitchCalibrationControls } from './usePitchCalibration';
import type { StudioContentRect } from './useStudioGesture';
export const PitchCalibrationOverlayView = ({
  pitch,
  width,
  height,
  contentRect,
}: {
  pitch: PitchCalibrationControls;
  width: number;
  height: number;
  contentRect: StudioContentRect;
}): ReactElement | null => {
  const theme = useTheme();
  if (!pitch.editing) return null;
  const move = (event: PointerEvent<SVGCircleElement>, index: number): void => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (
      !rect?.width ||
      !rect.height ||
      !contentRect.width ||
      !contentRect.height
    )
      return;
    pitch.onCornerChange(
      index,
      (((event.clientX - rect.left) * width) / rect.width -
        contentRect.offsetX) /
        contentRect.width,
      (((event.clientY - rect.top) * height) / rect.height -
        contentRect.offsetY) /
        contentRect.height,
    );
  };
  const points = pitch.draft.corners.map((point) => ({
    x: point.x * contentRect.width + contentRect.offsetX,
    y: point.y * contentRect.height + contentRect.offsetY,
  }));
  return (
    <svg
      aria-label="平面較正の4点"
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <polygon
        points={points.map((point) => `${point.x},${point.y}`).join(' ')}
        fill={theme.custom.tokens.interactive.selected}
        stroke={theme.palette.primary.main}
        strokeWidth={2}
      />
      {points.map((point, index) => (
        <g key={index}>
          <circle
            aria-label={`較正点${index + 1}`}
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pitch.draft.corners[index].x * 100)}
            aria-valuetext={`横${Math.round(pitch.draft.corners[index].x * 100)}%、縦${Math.round(pitch.draft.corners[index].y * 100)}%`}
            cx={point.x}
            cy={point.y}
            r={12}
            fill={theme.palette.background.paper}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            style={{
              pointerEvents: 'auto',
              touchAction: 'none',
              cursor: 'move',
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              event.stopPropagation();
            }}
            onPointerMove={(event) => move(event, index)}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onKeyDown={(event) => {
              const delta = event.shiftKey ? 0.01 : 0.001;
              const point = pitch.draft.corners[index];
              if (event.key.startsWith('Arrow')) {
                event.preventDefault();
                event.stopPropagation();
                pitch.onCornerChange(
                  index,
                  point.x +
                    (event.key === 'ArrowRight'
                      ? delta
                      : event.key === 'ArrowLeft'
                        ? -delta
                        : 0),
                  point.y +
                    (event.key === 'ArrowDown'
                      ? delta
                      : event.key === 'ArrowUp'
                        ? -delta
                        : 0),
                );
              }
            }}
          />
          <text
            x={point.x}
            y={point.y + 4}
            textAnchor="middle"
            fill={theme.palette.text.primary}
            fontSize={12}
            style={{ pointerEvents: 'none' }}
          >
            {index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
};
