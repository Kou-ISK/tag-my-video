import type { ReactElement } from 'react';
import { Button, LinearProgress, Stack, Typography } from '@mui/material';
import type { TacticsTrackingProps } from './tracking/useTacticsTracking';
export const TacticsTrackingView = (
  props: TacticsTrackingProps,
): ReactElement => (
  <Stack spacing={1} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
    <Typography variant="subtitle2">映像追跡</Typography>
    <Typography variant="caption" color="text.secondary">
      現在の再生位置から、描画の中央の模様を追跡します（最大20秒）。遮蔽やカメラ切替で停止した場合は、位置を修正して再試行できます。
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
        選択した描画を追跡
      </Button>
    )}
    {props.message && (
      <Typography role="status" variant="body2">
        {props.message}
      </Typography>
    )}
    {props.hasResult && (
      <Stack direction="row" spacing={1}>
        <Button onClick={props.onApply}>結果を適用</Button>
        <Button onClick={props.onDiscard}>破棄</Button>
      </Stack>
    )}
  </Stack>
);
