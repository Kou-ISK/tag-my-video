import type { ReactElement } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { Pause, PlayArrow } from '@mui/icons-material';

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
    onClick: () => void,
    outer: boolean,
  ): ReactElement => (
    <Tooltip title={label}>
      <span>
        <IconButton
          aria-label={label}
          disabled={props.disabled}
          onClick={onClick}
          size="small"
          sx={{
            width: outer ? 30 : 26,
            height: 30,
            p: 0.5,
            borderRadius: 0,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box
            aria-hidden="true"
            sx={{ display: 'flex', gap: '3px', alignItems: 'center' }}
          >
            {[0, 1, 2, 3].map((bar) => (
              <Box
                key={bar}
                sx={{
                  width: '2px',
                  height: outer ? 17 : 21,
                  bgcolor: 'currentColor',
                  opacity: 0.7,
                }}
              />
            ))}
          </Box>
        </IconButton>
      </span>
    </Tooltip>
  );
  return (
    <Stack
      direction="row"
      alignItems="center"
      role="group"
      aria-label="映像再生操作"
      sx={{
        flexShrink: 0,
        border: 2,
        borderColor: 'divider',
        borderRadius: '4px',
        overflow: 'hidden',
        background: (theme) =>
          `linear-gradient(180deg, ${theme.custom.tokens.surface.raised}, ${theme.custom.tokens.surface.canvas} 45%, ${theme.custom.tokens.surface.raised})`,
      }}
    >
      {props.outerBackward &&
        control(props.outerBackward.label, props.outerBackward.onClick, true)}
      {control(props.backwardLabel, props.onBackward, false)}
      <Tooltip title={props.playing ? '一時停止' : '再生'}>
        <span>
          <IconButton
            aria-label={props.playing ? '一時停止' : '再生'}
            disabled={props.disabled}
            onClick={props.onTogglePlay}
            sx={{
              width: 32,
              height: 30,
              borderRadius: 0,
              color: 'primary.main',
            }}
          >
            {props.playing ? <Pause fontSize="small" /> : <PlayArrow />}
          </IconButton>
        </span>
      </Tooltip>
      {control(props.forwardLabel, props.onForward, false)}
      {props.outerForward &&
        control(props.outerForward.label, props.outerForward.onClick, true)}
    </Stack>
  );
};
