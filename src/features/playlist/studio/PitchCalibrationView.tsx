import type { ReactElement } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import type { PitchCalibrationControls } from './usePitchCalibration';
export const PitchCalibrationView = (
  props: PitchCalibrationControls & { disabled: boolean },
): ReactElement => (
  <Stack spacing={1}>
    <Typography variant="subtitle2">平面較正</Typography>
    <Typography variant="caption" color="text.secondary">
      映像内の既知の長方形を4点で指定します。カメラが動いた場合は、その場面で較正し直してください。
    </Typography>
    {props.editing ? (
      <>
        <Stack direction="row" spacing={1}>
          <TextField
            label="横の実寸（m）"
            type="number"
            value={props.draft.widthMeters}
            slotProps={{ htmlInput: { min: 0.1, max: 200 } }}
            onChange={(event) =>
              props.onSizeChange(
                Number(event.target.value),
                props.draft.lengthMeters,
              )
            }
          />
          <TextField
            label="縦の実寸（m）"
            type="number"
            value={props.draft.lengthMeters}
            slotProps={{ htmlInput: { min: 0.1, max: 200 } }}
            onChange={(event) =>
              props.onSizeChange(
                props.draft.widthMeters,
                Number(event.target.value),
              )
            }
          />
        </Stack>
        <Typography variant="caption">
          映像上の1→2→3→4を長方形の角へ合わせてください。横は1–2、縦は2–3です。
        </Typography>
        {!props.valid && (
          <Typography color="error" role="alert" variant="caption">
            4点を交差しない順序で配置し、実寸を入力してください。
          </Typography>
        )}
        <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button
            disabled={props.disabled || !props.valid}
            onClick={props.onApply}
          >
            較正を保存
          </Button>
          <Button onClick={props.onCancel}>キャンセル</Button>
        </Stack>
      </>
    ) : (
      <>
        <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button disabled={props.disabled} onClick={props.onBegin}>
            {props.calibrated ? '較正を編集' : '4点で較正'}
          </Button>
          <Button
            disabled={props.disabled || !props.calibrated}
            onClick={props.onClear}
          >
            較正を解除
          </Button>
        </Stack>
        {props.calibrated && (
          <Button disabled={props.disabled} onClick={props.onAddZone}>
            平面に領域を追加
          </Button>
        )}
        {props.distance !== null && (
          <Typography role="status" variant="body2">
            選択した線の距離：約 {props.distance.toFixed(2)} m
          </Typography>
        )}
      </>
    )}
  </Stack>
);
