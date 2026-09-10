import { StudioTimeRulerView } from './StudioTimeRulerView';
import type { ReactElement } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import type { DrawingObject } from '../../../types/playlist/core';
import { STUDIO_TOOLS } from './studioGeometry';
export interface TacticsTimelineProps {
  objects: DrawingObject[];
  time: number;
  min: number;
  max: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSeek: (time: number) => void;
}
export const TacticsTimelineView = (
  props: TacticsTimelineProps,
): ReactElement => {
  const duration = Math.max(0.001, props.max - props.min);
  const percent = (time: number): number =>
    Math.max(0, Math.min(100, ((time - props.min) / duration) * 100));
  return (
    <Box
      role="region"
      aria-label="Paint 描画タイムライン"
      sx={{
        maxHeight: 180,
        px: 1.5,
        overflowY: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        flexShrink: 0,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '112px minmax(0, 1fr)',
            alignItems: 'center',
            height: 42,
          }}
        >
          <Typography variant="caption" sx={{ px: 1 }}>
            描画 · {props.objects.length}
          </Typography>
          <StudioTimeRulerView
            min={props.min}
            max={props.max}
            time={props.time}
            onSeek={props.onSeek}
          />
        </Box>
        {props.objects.length === 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ p: 1, display: 'block' }}
          >
            描画を追加すると表示区間がここに並びます。
          </Typography>
        )}
        {props.objects.map((object) => (
          <Box
            key={object.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '112px minmax(0, 1fr)',
              height: 26,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <ButtonBase
              onClick={() => props.onSelect(object.id)}
              sx={{
                px: 1,
                justifyContent: 'flex-start',
                overflow: 'hidden',
                bgcolor:
                  object.id === props.selectedId
                    ? 'action.selected'
                    : undefined,
              }}
            >
              <Typography variant="caption" noWrap>
                {object.text ||
                  STUDIO_TOOLS.find((tool) => tool.id === object.type)?.label}
              </Typography>
            </ButtonBase>
            <Box sx={{ position: 'relative', minWidth: 0 }}>
              <ButtonBase
                aria-label={`${object.text || object.type}の表示区間`}
                onClick={() => {
                  props.onSelect(object.id);
                  props.onSeek(
                    Math.max(props.min, Math.min(props.max, object.timestamp)),
                  );
                }}
                sx={{
                  position: 'absolute',
                  top: 5,
                  height: 16,
                  borderRadius: 0.5,
                  minWidth: 5,
                  left: `${percent(object.timestamp)}%`,
                  width: `${Math.max(0, percent(object.timestamp + (object.motion?.duration ?? 0)) - percent(object.timestamp))}%`,
                  bgcolor: object.color,
                  opacity: object.id === props.selectedId ? 1 : 0.55,
                }}
              />
              {object.motion?.keyframes.map((key) => (
                <ButtonBase
                  key={key.time}
                  aria-label={`${(object.timestamp + key.time).toFixed(2)}秒へ移動`}
                  onClick={() => {
                    props.onSelect(object.id);
                    props.onSeek(object.timestamp + key.time);
                  }}
                  sx={{
                    position: 'absolute',
                    left: `calc(${percent(object.timestamp + key.time)}% - 12px)`,
                    top: 1,
                    width: 24,
                    height: 24,
                    '&::after': {
                      content: '""',
                      width: 8,
                      height: 8,
                      transform: 'rotate(45deg)',
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'text.primary',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        ))}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 112,
            right: 0,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '1px',
              left: `${percent(props.time)}%`,
              bgcolor: 'primary.main',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
