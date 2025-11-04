import React, { useMemo } from 'react';
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Forward10Icon from '@mui/icons-material/Forward10';
import Forward30Icon from '@mui/icons-material/Forward30';
import Replay10Icon from '@mui/icons-material/Replay10';
import Replay30Icon from '@mui/icons-material/Replay30';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import SpeedIcon from '@mui/icons-material/Speed';
import { ShortcutGuide } from '../../../../../components/ShortcutGuide';

const SPEED_PRESETS: Array<{
  label: string;
  value: number;
  icon: React.ReactNode;
}> = [
  {
    label: '0.5x',
    value: 0.5,
    icon: <SlowMotionVideoIcon fontSize="small" />,
  },
  {
    label: '2x',
    value: 2,
    icon: <SpeedIcon fontSize="small" />,
  },
  {
    label: '4x',
    value: 4,
    icon: <SpeedIcon fontSize="small" />,
  },
  {
    label: '6x',
    value: 6,
    icon: <SpeedIcon fontSize="small" />,
  },
];

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

const CONTROL_BUTTON_SX = {
  color: 'white',
  borderRadius: 1.5,
} as const;

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

  const renderIconButton = ({
    title,
    actionKey,
    onClick,
    icon,
    emphasize,
    active,
  }: ControlButtonConfig) => {
    const isFlashing = !!flashStates[actionKey];
    const isActive = !!active || isFlashing;
    const baseBg = emphasize
      ? 'rgba(255,255,255,0.2)'
      : 'rgba(255,255,255,0.12)';
    const hoverBg = emphasize
      ? 'rgba(255,255,255,0.28)'
      : 'rgba(255,255,255,0.24)';
    const activeBg = emphasize ? 'primary.main' : 'rgba(255,255,255,0.32)';
    const activeHoverBg = emphasize ? 'primary.dark' : 'rgba(255,255,255,0.4)';

    return (
      <Tooltip title={title} key={actionKey}>
        <span>
          <IconButton
            onClick={() => {
              if (!hasVideos) return;
              onClick();
              triggerFlash(actionKey);
            }}
            disabled={!hasVideos}
            sx={{
              ...CONTROL_BUTTON_SX,
              bgcolor: isActive ? activeBg : baseBg,
              '&:hover': {
                bgcolor: isActive ? activeHoverBg : hoverBg,
              },
              boxShadow: isFlashing
                ? '0 0 0 2px rgba(255,255,255,0.4)'
                : undefined,
            }}
            size="large"
          >
            {icon}
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  const renderSpeedPresetButton = (preset: {
    label: string;
    value: number;
    icon: React.ReactNode;
  }) => {
    const key = `speed-${preset.value}`;
    const isActive = Math.abs(playbackRate - preset.value) < 0.0001;
    const isFlashing = !!flashStates[key];
    const lit = isActive || isFlashing;

    return (
      <Tooltip title={`${preset.label}で再生`} key={preset.label}>
        <span>
          <IconButton
            onClick={() => {
              if (!hasVideos) return;
              onSpeedPresetSelect(preset.value);
              triggerFlash(key);
            }}
            disabled={!hasVideos}
            sx={{
              ...CONTROL_BUTTON_SX,
              flexDirection: 'column',
              bgcolor: lit ? 'primary.main' : 'rgba(255,255,255,0.12)',
              '&:hover': {
                bgcolor: lit ? 'primary.dark' : 'rgba(255,255,255,0.24)',
              },
              color: 'white',
            }}
            size="large"
          >
            {preset.icon}
            <Typography
              variant="caption"
              sx={{ lineHeight: 1, color: 'inherit', fontWeight: 'bold' }}
            >
              {preset.label}
            </Typography>
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
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
          {controlButtons.map((button) => renderIconButton(button))}
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: 'rgba(255,255,255,0.16)',
            display: { xs: 'none', md: 'block' },
          }}
        />

        <Stack direction="row" spacing={0.5} alignItems="center">
          {SPEED_PRESETS.map((preset) => renderSpeedPresetButton(preset))}
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: 'rgba(255,255,255,0.16)',
            display: { xs: 'none', md: 'block' },
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <FormControl
            size="small"
            variant="outlined"
            sx={{
              minWidth: 120,
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputLabel-shrink': { color: 'primary.light' },
              '& .MuiOutlinedInput-input': { color: 'white' },
              '& .MuiSvgIcon-root': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.6)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.light',
              },
            }}
          >
            <InputLabel id="playback-speed-label">Speed</InputLabel>
            <Select
              labelId="playback-speed-label"
              label="Speed"
              value={String(playbackRate)}
              onChange={onSpeedChange}
              sx={{
                '& .MuiSelect-icon': { color: 'white' },
              }}
            >
              {speedOptions.map((speed) => (
                <MenuItem key={speed} value={speed.toString()}>
                  {speed}x
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ShortcutGuide />
        </Box>

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
