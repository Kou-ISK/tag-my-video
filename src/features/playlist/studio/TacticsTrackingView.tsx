import type { ReactElement } from 'react';
import { Button, LinearProgress, Stack, Typography } from '@mui/material';
import type { TacticsTrackingProps } from './tracking/useTacticsTracking';
export const TacticsTrackingView = (
  props: TacticsTrackingProps,
): ReactElement => (
  <Stack spacing={1} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
    <Typography variant="subtitle2">自動追尾</Typography>
    <Typography variant="caption" color="text.secondary">
      一時停止し、選手を囲む図形を選んで開始します（最大20秒）。成功すると動きを自動反映します。足元のディスクは上側の選手の模様を探します。見失った場合は位置を修正して再試行してください。
    </Typography>
    {props.running ? (
      <>
        <LinearProgress
          aria-label="追跡の進捗"
          variant="determinate"
          value={props.progress * 100}
        />
        <Button onClick={props.onCancel}>中止</Button>
      </>
    ) : (
      <Button
        variant="outlined"
        disabled={!props.available}
        onClick={props.onStart}
      >
        自動追尾を開始
      </Button>
    )}
    {props.message && (
      <Typography role="status" variant="body2">
        {props.message}
      </Typography>
    )}
    {props.hasResult && (
      <Stack direction="row" spacing={1}>
        <Button onClick={props.onApply}>追尾できた範囲を適用</Button>
        <Button onClick={props.onDiscard}>破棄</Button>
      </Stack>
    )}
  </Stack>
);
