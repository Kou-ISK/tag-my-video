import type { ReactElement } from 'react';
import { Button, Slider, Stack, TextField, Typography } from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';

export interface StudioTransportViewProps {
  time: number;
  min: number;
  max: number;
  playing: boolean;
  disabled: boolean;
  freezeDuration: number;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onFreezeDurationChange: (duration: number) => void;
}
export const StudioTransportView = (
  props: StudioTransportViewProps,
): ReactElement => (
  <Stack
    spacing={1}
    sx={{
      px: 2,
      py: 1,
      bgcolor: 'background.paper',
      borderTop: 1,
      borderColor: 'divider',
      flexShrink: 0,
    }}
  >
    <Slider
      size="small"
      aria-label="Studio 再生位置"
      min={props.min}
      max={Math.max(props.min + 0.001, props.max)}
      step={0.01}
      value={props.time}
      disabled={props.disabled}
      onChange={(_, value) => {
        if (typeof value === 'number') props.onSeek(value);
      }}
    />
    <Stack direction="row" alignItems="center" spacing={2}>
      <Button
        size="small"
        startIcon={props.playing ? <Pause /> : <PlayArrow />}
        onClick={props.onTogglePlay}
        disabled={props.disabled}
      >
        {props.playing ? '停止して編集' : 'プレビュー'}
      </Button>
      <Typography variant="technical" sx={{ flex: 1 }}>
        {props.time.toFixed(2)} s
      </Typography>
      <TextField
        label="静止時間（秒）"
        type="number"
        size="small"
        value={props.freezeDuration}
        disabled={props.disabled || props.playing}
        onChange={(event) => {
          const value = Number(event.target.value);
          if (Number.isFinite(value) && value >= 1 && value <= 60)
            props.onFreezeDurationChange(value);
        }}
        slotProps={{ htmlInput: { min: 1, max: 60, step: 0.5 } }}
        sx={{ width: 128 }}
      />
    </Stack>
  </Stack>
);
