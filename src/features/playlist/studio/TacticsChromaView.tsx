import type { ReactElement } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import type { TacticsChromaProps } from './useTacticsChroma';
export const TacticsChromaView = (props: TacticsChromaProps): ReactElement => (
  <Stack spacing={1}>
    <Typography variant="subtitle2">選手の背後に描画</Typography>
    <Typography variant="caption" color="text.secondary">
      映像から芝色を抽出し、描画をその色の範囲に限定します。ユニフォームが芝色に近い場合は範囲を調整してください。
    </Typography>
    <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
      <Button disabled={props.disabled} onClick={props.onExtract}>
        芝色を抽出
      </Button>
      <Button
        disabled={props.disabled || !props.value}
        onClick={() => props.onChange(undefined)}
      >
        解除
      </Button>
    </Stack>
    {props.value && (
      <Stack direction="row" spacing={1}>
        <TextField
          label="芝色"
          type="color"
          value={props.value.color}
          disabled={props.disabled}
          onChange={(event) =>
            props.value &&
            props.onChange({ ...props.value, color: event.target.value })
          }
          sx={{ width: 80 }}
        />
        <TextField
          label="色の範囲 %"
          type="number"
          value={Math.round(props.value.similarity * 100)}
          disabled={props.disabled}
          slotProps={{ htmlInput: { min: 1, max: 50 } }}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (props.value && value >= 1 && value <= 50)
              props.onChange({ ...props.value, similarity: value / 100 });
          }}
          sx={{ flex: 1 }}
        />
      </Stack>
    )}
    {props.error && (
      <Typography role="alert" color="error" variant="body2">
        {props.error}
      </Typography>
    )}
  </Stack>
);
