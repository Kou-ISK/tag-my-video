import type { ReactElement, PointerEvent } from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import type { TacticsTrackingProps } from './tracking/useTacticsTracking';
import type { StudioContentRect } from './useStudioGesture';

export interface TrackingTargetOverlayProps {
  selection: NonNullable<TacticsTrackingProps['targetSelection']>;
  contentRect: StudioContentRect;
  width: number;
  height: number;
}
/** 追尾用の範囲は描画とは別の一時的な選択。保存する図形の形を変えない。 */
export const TrackingTargetOverlayView = ({
  selection,
  contentRect,
  width,
  height,
}: TrackingTargetOverlayProps): ReactElement => {
  const theme = useTheme();
  const point = (
    event: PointerEvent<SVGSVGElement>,
  ): { x: number; y: number } => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          1,
          (((event.clientX - rect.left) * width) / Math.max(1, rect.width) -
            contentRect.offsetX) /
            Math.max(1, contentRect.width),
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          1,
          (((event.clientY - rect.top) * height) / Math.max(1, rect.height) -
            contentRect.offsetY) /
            Math.max(1, contentRect.height),
        ),
      ),
    };
  };
  const region = selection.region;
  return (
    <Box
      sx={{ position: 'absolute', inset: 0 }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' || event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          if (event.key === 'Escape') selection.onCancel();
          else selection.onConfirm();
        }
      }}
    >
      <svg
        tabIndex={0}
        aria-label="追尾対象の範囲をドラッグで指定"
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.stopPropagation();
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          const at = point(event);
          selection.onBegin(at.x, at.y);
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const at = point(event);
          selection.onMove(at.x, at.y);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            const at = point(event);
            selection.onMove(at.x, at.y);
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={selection.onCancel}
      >
        {region && (
          <rect
            x={contentRect.offsetX + region.minX * contentRect.width}
            y={contentRect.offsetY + region.minY * contentRect.height}
            width={(region.maxX - region.minX) * contentRect.width}
            height={(region.maxY - region.minY) * contentRect.height}
            fill={theme.custom.tokens.interactive.selected}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            strokeDasharray="6 3"
          />
        )}
      </svg>
      <Stack
        direction="row"
        useFlexGap
        spacing={1}
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          right: 8,
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ flex: '1 1 100%' }}>
          選手の上半身を囲んでください。芝や隣の選手は枠から外します。
        </Typography>
        <Button
          sx={{ whiteSpace: 'nowrap' }}
          disabled={
            !region ||
            region.maxX - region.minX < 0.005 ||
            region.maxY - region.minY < 0.005
          }
          onClick={selection.onConfirm}
        >
          この範囲を追尾
        </Button>
        <Button sx={{ whiteSpace: 'nowrap' }} onClick={selection.onCancel}>
          中止
        </Button>
      </Stack>
    </Box>
  );
};
