import type { ReactElement } from 'react';
import {
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { MovieTransportView } from '../../../components/ui';

export interface StudioTransportViewProps {
  coachMode?: boolean;
  onCoachModeChange?: (value: boolean) => void;
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
      aria-label="Tactics 再生位置"
      min={props.min}
      max={Math.max(props.min + 0.001, props.max)}
      step={0.01}
      value={props.time}
      disabled={props.disabled}
      onChange={(_, value) => {
        if (typeof value === 'number') props.onSeek(value);
      }}
    />
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ flexWrap: 'wrap', rowGap: 1 }}
    >
      {props.onCoachModeChange && (
        <ToggleButtonGroup
          exclusive
          size="small"
          value={props.coachMode ? 'coach' : 'edit'}
          aria-label="Tactics 表示モード"
          onChange={(_, value: string | null) => {
            if (value) props.onCoachModeChange?.(value === 'coach');
          }}
        >
          <ToggleButton value="edit">編集</ToggleButton>
          <ToggleButton value="coach">Coach</ToggleButton>
        </ToggleButtonGroup>
      )}
      <MovieTransportView
        playing={props.playing}
        disabled={props.disabled}
        onTogglePlay={props.onTogglePlay}
        backwardLabel="0.1秒戻る"
        forwardLabel="0.1秒進む"
        onBackward={() => props.onSeek(Math.max(props.min, props.time - 0.1))}
        onForward={() => props.onSeek(Math.min(props.max, props.time + 0.1))}
        outerBackward={{
          label: 'クリップの先頭',
          onClick: () => props.onSeek(props.min),
        }}
        outerForward={{
          label: 'クリップの末尾',
          onClick: () => props.onSeek(props.max),
        }}
      />
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
