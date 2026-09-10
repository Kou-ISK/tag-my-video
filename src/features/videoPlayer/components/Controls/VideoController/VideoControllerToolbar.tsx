import type { ReactElement, ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { MovieTransportView } from '../../../../../components/ui';
import { SpeedSelector } from './toolbar/SpeedSelector';

interface VideoControllerToolbarProps {
  shortcutGuide?: ReactNode;
  hasVideos: boolean;
  isVideoPlaying: boolean;
  playbackRate: number;
  speedOptions: number[];
  flashStates: Record<string, boolean>;
  onTogglePlayback: () => void;
  onSeekAdjust: (deltaSeconds: number) => void;
  onSpeedPresetSelect: (value: number) => void;
  onSpeedChange: (event: SelectChangeEvent<string>) => void;
  triggerFlash: (key: string) => void;
  currentTimeLabel: string;
  smallSkipSeconds: number;
  largeSkipSeconds: number;
}

export const VideoControllerToolbar = (
  props: VideoControllerToolbarProps,
): ReactElement => {
  const seek = (delta: number, key: string): void => {
    props.onSeekAdjust(delta);
    props.triggerFlash(key);
  };
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{
        width: 'min(640px, 100%)',
        mx: 'auto',
        borderRadius: '5px',
        minHeight: 44,
        px: 1.5,
        gap: 1,
        flexWrap: 'wrap',
        bgcolor: (theme) => theme.custom.tokens.surface.work,
        border: 1,
        borderColor: 'divider',
        pointerEvents: 'auto',
      }}
    >
      <Box
        sx={{
          flex: '1 1 100px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {props.shortcutGuide}
        <SpeedSelector
          playbackRate={props.playbackRate}
          speedOptions={props.speedOptions}
          disabled={!props.hasVideos}
          onSpeedChange={props.onSpeedChange}
        />
      </Box>
      <MovieTransportView
        playing={props.isVideoPlaying}
        disabled={!props.hasVideos}
        onTogglePlay={() => {
          props.onTogglePlayback();
          props.triggerFlash('toggle-play');
        }}
        onBackward={() => seek(-props.smallSkipSeconds, 'rewind-10')}
        onForward={() => seek(props.smallSkipSeconds, 'forward-10')}
        backwardLabel={`${props.smallSkipSeconds}秒戻る`}
        forwardLabel={`${props.smallSkipSeconds}秒進む`}
        outerBackward={{
          label: `${props.largeSkipSeconds}秒戻る`,
          onClick: () => seek(-props.largeSkipSeconds, 'rewind-30'),
        }}
        outerForward={{
          label: `${props.largeSkipSeconds}秒進む`,
          onClick: () => seek(props.largeSkipSeconds, 'forward-30'),
        }}
      />
      <Typography
        variant="body2"
        sx={{
          flex: '1 1 100px',
          textAlign: 'right',
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          fontFamily: (theme) => theme.custom.typography.fontFamilyMono,
          fontVariantNumeric: 'tabular-nums',
          fontSize: 12,
        }}
      >
        {props.currentTimeLabel}
      </Typography>
    </Stack>
  );
};
