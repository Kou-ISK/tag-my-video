import type { ReactElement } from 'react';
import {
  Button,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { TacticsMotionProps } from './useTacticsMotion';
export const TacticsMotionView = (
  props: TacticsMotionProps,
): ReactElement | null => {
  const object = props.selected;
  if (!object) return null;
  const localTime = props.time - object.timestamp;
  return (
    <Stack spacing={1}>
      <FormControlLabel
        label="映像中に表示する"
        control={
          <Switch
            checked={Boolean(object.motion)}
            disabled={object.timestamp >= props.maxTime}
            onChange={(_, enabled) => props.onMotionToggle(enabled)}
          />
        }
      />
      {object.motion && (
        <>
          <TextField
            type="number"
            label="表示時間（秒）"
            value={object.motion.duration}
            slotProps={{
              htmlInput: {
                min: 0.1,
                max: Math.min(600, props.maxTime - object.timestamp),
                step: 0.1,
              },
            }}
            onChange={(event) =>
              props.onDurationChange(Number(event.target.value))
            }
          />
          <Typography variant="caption" color="text.secondary">
            再生位置を移して図形をドラッグすると、その時刻の位置を記録します。点の間は滑らかに移動します。
          </Typography>
          <Stack
            direction="row"
            useFlexGap
            spacing={1}
            sx={{ flexWrap: 'wrap' }}
          >
            <Button
              disabled={
                localTime < 0 ||
                localTime > object.motion.duration ||
                object.motion.keyframes.length >= 256
              }
              onClick={props.onAddKeyframe}
            >
              位置を記録
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            位置の編集・削除は下のタイムラインの◆を選択します。開始点は位置のみ編集できます。
          </Typography>
        </>
      )}
    </Stack>
  );
};
