import type { ReactElement } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Brush,
  Fullscreen,
  FullscreenExit,
  Loop,
  PlaylistPlay,
  VolumeOff,
  VolumeUp,
} from '@mui/icons-material';
import { MovieTransportView } from '../../../components/ui';
import { PLAYLIST_CONTROL_LABELS } from '../constants/playlistControls';

type SliderMark = { value: number; label: string };

type PlaylistVideoControlsOverlayProps = {
  visible: boolean;
  currentTime: number;
  sliderMin: number;
  sliderMax: number;
  marks: SliderMark[];
  isPlaying: boolean;
  isFrozen: boolean;
  autoAdvance: boolean;
  loopPlaylist: boolean;
  isDrawingMode: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  onSeek: (event: Event, value: number | number[]) => void;
  onSeekCommitted: () => void;
  onPrevious: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onToggleAutoAdvance: () => void;
  onToggleLoop: () => void;
  onToggleDrawingMode: () => void;
  onToggleMute: () => void;
  onVolumeChange: (event: Event, value: number | number[]) => void;
  onToggleFullscreen: () => void;
};

export const PlaylistVideoControlsOverlay = (
  props: PlaylistVideoControlsOverlayProps,
): ReactElement => {
  const action = (
    label: string,
    icon: ReactElement,
    onClick: () => void,
    active = false,
  ): ReactElement => (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        aria-pressed={active}
        size="small"
        onClick={onClick}
        color={active ? 'primary' : 'default'}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
  const seek = (time: number): void => {
    props.onSeek(
      new Event('playlist-jog'),
      Math.min(props.sliderMax, Math.max(props.sliderMin, time)),
    );
    props.onSeekCommitted();
  };
  return (
    <Paper
      sx={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(640px, calc(100% - 24px))',
        px: 1.5,
        pb: 0.75,
        bgcolor: (theme) => theme.custom.tokens.surface.overlay,
        backdropFilter: 'blur(16px)',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        opacity: props.visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: props.visible ? 'auto' : 'none',
        zIndex: (theme) => theme.custom.zIndex.stickyChrome,
        '&:focus-within': { opacity: 1, pointerEvents: 'auto' },
      }}
    >
      <Slider
        aria-label="映像の再生位置"
        size="small"
        value={props.currentTime}
        min={props.sliderMin}
        max={Math.max(props.sliderMin + 0.001, props.sliderMax)}
        step={0.01}
        onChange={props.onSeek}
        onChangeCommitted={props.onSeekCommitted}
        marks={props.marks}
        sx={{ height: 2, py: 1, '& .MuiSlider-thumb': { width: 8, height: 8 } }}
      />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ flexWrap: 'wrap', rowGap: 1 }}
      >
        <Stack direction="row" sx={{ flex: 1 }}>
          {action(
            props.loopPlaylist
              ? PLAYLIST_CONTROL_LABELS.loop.on
              : PLAYLIST_CONTROL_LABELS.loop.off,
            <Loop fontSize="small" />,
            props.onToggleLoop,
            props.loopPlaylist,
          )}
          {action(
            props.autoAdvance
              ? PLAYLIST_CONTROL_LABELS.autoAdvance.on
              : PLAYLIST_CONTROL_LABELS.autoAdvance.off,
            <PlaylistPlay fontSize="small" />,
            props.onToggleAutoAdvance,
            props.autoAdvance,
          )}
        </Stack>
        <MovieTransportView
          playing={props.isPlaying && !props.isFrozen}
          onTogglePlay={props.onTogglePlay}
          backwardLabel="1秒戻る"
          forwardLabel="1秒進む"
          onBackward={() => seek(props.currentTime - 1)}
          onForward={() => seek(props.currentTime + 1)}
          outerBackward={{ label: '前のクリップ', onClick: props.onPrevious }}
          outerForward={{ label: '次のクリップ', onClick: props.onNext }}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          sx={{ flex: 1 }}
        >
          {action(
            props.isMuted ? 'ミュート解除' : 'ミュート',
            props.isMuted ? (
              <VolumeOff fontSize="small" />
            ) : (
              <VolumeUp fontSize="small" />
            ),
            props.onToggleMute,
            props.isMuted,
          )}
          <Slider
            aria-label="音量"
            size="small"
            value={props.volume}
            min={0}
            max={1}
            step={0.05}
            onChange={props.onVolumeChange}
            sx={{ width: 44, mx: 1 }}
          />
          {action(
            props.isDrawingMode
              ? PLAYLIST_CONTROL_LABELS.drawing.on
              : PLAYLIST_CONTROL_LABELS.drawing.off,
            <Brush fontSize="small" />,
            props.onToggleDrawingMode,
            props.isDrawingMode,
          )}
          {action(
            props.isFullscreen ? '全画面を終了' : '全画面',
            props.isFullscreen ? (
              <FullscreenExit fontSize="small" />
            ) : (
              <Fullscreen fontSize="small" />
            ),
            props.onToggleFullscreen,
          )}
        </Stack>
      </Stack>
      <Box sx={{ textAlign: 'center', mt: 0.5 }}>
        <Typography variant="technical" color="text.secondary">
          {props.currentTime.toFixed(2)} / {props.sliderMax.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
};
