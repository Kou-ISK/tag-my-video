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
  shortcutGuide?: React.ReactNode;
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
  shortcutGuide,
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
        title: `${largeSkipSeconds}秒戻る`,
        actionKey: 'rewind-30',
        onClick: () => onSeekAdjust(-largeSkipSeconds),
        icon: <Replay30Icon />,
      },
      {
        title: `${smallSkipSeconds}秒戻る`,
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
        title: `${smallSkipSeconds}秒進む`,
        actionKey: 'forward-10',
        onClick: () => onSeekAdjust(smallSkipSeconds),
        icon: <Forward10Icon />,
      },
      {
        title: `${largeSkipSeconds}秒進む`,
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
        backgroundColor: (theme) => theme.custom.tokens.surface.work,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        pointerEvents: 'auto',
        p: 0.75,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
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

        {shortcutGuide}
        <Box sx={{ flexGrow: 1 }} />

        <Typography
          variant="body2"
          sx={{
            textAlign: { xs: 'left', md: 'right' },
            color: 'primary.main',
            fontFamily: (theme) => theme.custom.typography.fontFamilyMono,
            fontVariantNumeric: 'tabular-nums',
            bgcolor: 'background.default',
            border: 1,
            borderColor: 'divider',
            borderRadius: 0.5,
            px: 1.5,
            py: 1,
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
