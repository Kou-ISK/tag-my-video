import React, { useMemo } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Forward10Icon from '@mui/icons-material/Forward10';
import Forward30Icon from '@mui/icons-material/Forward30';
import Replay10Icon from '@mui/icons-material/Replay10';
import Replay30Icon from '@mui/icons-material/Replay30';
import { ControlButton } from './toolbar/ControlButton';
import { SpeedPresetButton } from './toolbar/SpeedPresetButton';
import { SpeedSelector } from './toolbar/SpeedSelector';
import { SPEED_PRESETS } from './toolbar/constants';

interface VideoControllerToolbarProps {
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

interface ControlButtonConfig {
  title: string;
  actionKey: string;
  onClick: () => void;
  icon: React.ReactNode;
  emphasize?: boolean;
  active?: boolean;
}

export const VideoControllerToolbar: React.FC<VideoControllerToolbarProps> = ({
  hasVideos,
  isVideoPlaying,
  playbackRate,
  speedOptions,
  flashStates,
  onTogglePlayback,
  onSeekAdjust,
  onSpeedPresetSelect,
  onSpeedChange,
  triggerFlash,
  currentTimeLabel,
  smallSkipSeconds,
  largeSkipSeconds,
}) => {
  const controlButtons: ControlButtonConfig[] = useMemo(
    () => [
      {
        title: '30秒戻る',
        actionKey: 'rewind-30',
        onClick: () => onSeekAdjust(-largeSkipSeconds),
        icon: <Replay30Icon />,
      },
      {
        title: '10秒戻る',
        actionKey: 'rewind-10',
        onClick: () => onSeekAdjust(-smallSkipSeconds),
        icon: <Replay10Icon />,
      },
      {
        title: isVideoPlaying ? '一時停止' : '再生',
        actionKey: 'toggle-play',
        onClick: onTogglePlayback,
        icon: isVideoPlaying ? <PauseIcon /> : <PlayArrowIcon />,
        emphasize: true,
        active: isVideoPlaying,
      },
      {
        title: '10秒進む',
        actionKey: 'forward-10',
        onClick: () => onSeekAdjust(smallSkipSeconds),
        icon: <Forward10Icon />,
      },
      {
        title: '30秒進む',
        actionKey: 'forward-30',
        onClick: () => onSeekAdjust(largeSkipSeconds),
        icon: <Forward30Icon />,
      },
    ],
    [
      isVideoPlaying,
      largeSkipSeconds,
      smallSkipSeconds,
      onSeekAdjust,
      onTogglePlayback,
    ],
  );

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: (theme) => theme.custom.glass.panel,
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        pointerEvents: 'auto',
        p: { xs: 1.25, md: 1.5 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: { xs: 1, md: 1.5 },
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          {controlButtons.map((button) => (
            <ControlButton
              key={button.actionKey}
              title={button.title}
              icon={button.icon}
              actionKey={button.actionKey}
              disabled={!hasVideos}
              flashing={!!flashStates[button.actionKey]}
              active={button.active}
              emphasize={button.emphasize}
              onClick={button.onClick}
              onTriggerFlash={triggerFlash}
            />
          ))}
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: 'divider',
            display: { xs: 'none', md: 'block' },
          }}
        />

        <Stack direction="row" spacing={0.5} alignItems="center">
          {SPEED_PRESETS.map((preset) => (
            <SpeedPresetButton
              key={preset.label}
              label={preset.label}
              value={preset.value}
              icon={preset.icon}
              playbackRate={playbackRate}
              disabled={!hasVideos}
              flashing={!!flashStates[`speed-${preset.value}`]}
              onSelect={onSpeedPresetSelect}
              onTriggerFlash={triggerFlash}
            />
          ))}
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: 'divider',
            display: { xs: 'none', md: 'block' },
          }}
        />

        <SpeedSelector
          playbackRate={playbackRate}
          speedOptions={speedOptions}
          disabled={!hasVideos}
          onSpeedChange={onSpeedChange}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Typography
          variant="body2"
          sx={{
            textAlign: { xs: 'left', md: 'right' },
            color: 'white',
            fontWeight: 'bold',
            minWidth: { xs: 'auto', md: 140 },
            lineHeight: 1.2,
          }}
        >
          {currentTimeLabel}
        </Typography>
      </Box>
    </Box>
  );
};
