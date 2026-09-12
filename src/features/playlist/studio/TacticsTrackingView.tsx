import type { ReactElement } from 'react';
import { Button, LinearProgress, Stack, Typography } from '@mui/material';
import type { TacticsTrackingProps } from './tracking/useTacticsTracking';
export const TacticsTrackingView = (
  props: TacticsTrackingProps,
): ReactElement => (
  <Stack spacing={1} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
    <Typography variant="subtitle2">自動追尾</Typography>
    <Typography variant="caption" color="text.secondary">
      再生位置から最大20秒を追尾します。描画を選んで一時停止し、追尾対象の上半身を別の枠で指定します。図形のサイズは変更されません。途中で外れたら、その時刻で位置を直して再追尾できます。
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
        disabled={!props.available || Boolean(props.targetSelection)}
        onClick={props.onStart}
      >
        対象を指定して追尾
      </Button>
    )}
    {props.message && (
      <Typography role="status" variant="body2">
        {props.message}
      </Typography>
    )}
    {props.hasResult && (
      <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Button onClick={props.onApply}>追尾できた範囲を適用</Button>
        <Button onClick={props.onDiscard}>破棄</Button>
      </Stack>
    )}
  </Stack>
);
