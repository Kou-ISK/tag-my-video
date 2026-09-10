import type { ReactElement, ReactNode } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import {
  FastForward,
  FastRewind,
  Pause,
  PlayArrow,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

export interface MovieTransportViewProps {
  playing: boolean;
  disabled?: boolean;
  onTogglePlay: () => void;
  onBackward: () => void;
  onForward: () => void;
  backwardLabel: string;
  forwardLabel: string;
  outerBackward?: { label: string; onClick: () => void };
  outerForward?: { label: string; onClick: () => void };
}
/** 再生状態を持たない Movie Controller のジョグ操作部。 */
export const MovieTransportView = (
  props: MovieTransportViewProps,
): ReactElement => {
  const control = (
    label: string,
    icon: ReactNode,
    onClick: () => void,
  ): ReactElement => (
    <Tooltip title={label}>
      <span>
        <IconButton
          aria-label={label}
          disabled={props.disabled}
          onClick={onClick}
          size="small"
          sx={{
            width: 30,
            height: 32,
            color: 'text.secondary',
            borderRadius: 0.5,
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.25}
      role="group"
      aria-label="映像再生操作"
      sx={{
        px: 0.5,
        py: 0.25,
        flexShrink: 0,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        background: (theme) =>
          `linear-gradient(180deg, ${theme.custom.tokens.surface.canvas}, ${theme.custom.tokens.surface.raised})`,
      }}
    >
      {props.outerBackward &&
        control(
          props.outerBackward.label,
          <FastRewind fontSize="small" />,
          props.outerBackward.onClick,
        )}
      {control(
        props.backwardLabel,
        <ChevronLeft fontSize="small" />,
        props.onBackward,
      )}
      <Box
        sx={{ borderLeft: 1, borderRight: 1, borderColor: 'divider', px: 0.5 }}
      >
        <Tooltip title={props.playing ? '一時停止' : '再生'}>
          <span>
            <IconButton
              aria-label={props.playing ? '一時停止' : '再生'}
              disabled={props.disabled}
              onClick={props.onTogglePlay}
              sx={{ width: 38, height: 38, color: 'primary.main' }}
            >
              {props.playing ? <Pause /> : <PlayArrow />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      {control(
        props.forwardLabel,
        <ChevronRight fontSize="small" />,
        props.onForward,
      )}
      {props.outerForward &&
        control(
          props.outerForward.label,
          <FastForward fontSize="small" />,
          props.outerForward.onClick,
        )}
    </Stack>
  );
};
