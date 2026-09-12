import type { ReactElement } from 'react';
import { MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
interface SpeedSelectorProps {
  playbackRate: number;
  speedOptions: number[];
  disabled: boolean;
  onSpeedChange: (event: SelectChangeEvent<string>) => void;
}
export const SpeedSelector = (props: SpeedSelectorProps): ReactElement => (
  <Select
    variant="standard"
    disableUnderline
    value={String(props.playbackRate)}
    onChange={props.onSpeedChange}
    disabled={props.disabled}
    inputProps={{ 'aria-label': '再生速度' }}
    sx={{
      minWidth: 58,
      fontSize: 13,
      fontVariantNumeric: 'tabular-nums',
      '& .MuiSelect-select': { py: 0.5 },
    }}
  >
    {props.speedOptions.map((speed) => (
      <MenuItem key={speed} value={String(speed)}>
        {speed}×
      </MenuItem>
    ))}
  </Select>
);
