import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface SpeedSelectorProps {
  playbackRate: number;
  speedOptions: number[];
  disabled: boolean;
  onSpeedChange: (event: SelectChangeEvent<string>) => void;
}

export const SpeedSelector: React.FC<SpeedSelectorProps> = ({
  playbackRate,
  speedOptions,
  disabled,
  onSpeedChange,
}) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    flexWrap="wrap"
    sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
  >
    <FormControl size="small" variant="outlined" sx={{ minWidth: 104 }}>
      <InputLabel id="playback-speed-label">再生速度</InputLabel>
      <Select
        labelId="playback-speed-label"
        label="再生速度"
        value={String(playbackRate)}
        onChange={onSpeedChange}
        disabled={disabled}
      >
        {speedOptions.map((speed) => (
          <MenuItem key={speed} value={speed.toString()}>
            {speed}x
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Stack>
);
