import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { ShortcutGuide } from '../../../../../../components/ShortcutGuide';

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
        disabled={disabled}
        sx={{ '& .MuiSelect-icon': { color: 'white' } }}
      >
        {speedOptions.map((speed) => (
          <MenuItem key={speed} value={speed.toString()}>
            {speed}x
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <ShortcutGuide />
  </Stack>
);
