import type { ReactElement } from 'react';
import { MenuItem, TextField } from '@mui/material';
import { PLAYER_COUNTS } from './linkedDiscLayout';

export const StudioPlayerCountView = ({
  count,
  onChange,
}: {
  count: number;
  onChange: (count: number) => void;
}): ReactElement => (
  <TextField
    select
    fullWidth
    size="small"
    label="選手数"
    value={count}
    helperText="各ディスクの中心をドラッグして選手の足元へ配置"
    onChange={(event) => {
      const value = Number(event.target.value);
      if (PLAYER_COUNTS.includes(value)) onChange(value);
    }}
  >
    {PLAYER_COUNTS.map((value) => (
      <MenuItem key={value} value={value}>
        {value}人
      </MenuItem>
    ))}
  </TextField>
);
