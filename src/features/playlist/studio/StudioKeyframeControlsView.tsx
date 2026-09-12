import { StudioNumberFieldView } from './StudioNumberFieldView';
import type { ReactElement } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import type { StudioKeyframeControls } from './useStudioKeyframes';
export const StudioKeyframeControlsView = ({
  controls,
}: {
  controls: StudioKeyframeControls;
}): ReactElement => {
  const key = controls.selected;
  return (
    <Stack
      direction="row"
      useFlexGap
      spacing={1}
      sx={{ alignItems: 'center', flexWrap: 'wrap', py: 1 }}
    >
      <Button
        aria-label="タイムラインを縮小"
        disabled={controls.zoom <= 1}
        onClick={() => controls.onZoom(controls.zoom / 2)}
        sx={{ minWidth: 28 }}
      >
        −
      </Button>
      <Typography variant="caption">{controls.zoom}×</Typography>
      <Button
        aria-label="タイムラインを拡大"
        disabled={controls.zoom >= 16}
        onClick={() => controls.onZoom(controls.zoom * 2)}
        sx={{ minWidth: 28 }}
      >
        ＋
      </Button>
      {key ? (
        <>
          <StudioNumberFieldView
            key={`${key.objectId}:${key.time}`}
            label="キーフレーム時刻（秒）"
            value={Number(key.absoluteTime.toFixed(3))}
            disabled={!controls.enabled || key.time === 0}
            step={1 / 30}
            onCommit={controls.onMove}
            width={155}
          />
          {(['x', 'y'] as const).map((axis) => (
            <StudioNumberFieldView
              key={`${key.objectId}:${key.time}:${axis}:${key[axis]}`}
              label={`${axis.toUpperCase()}移動量`}
              value={Number(key[axis].toFixed(2))}
              disabled={!controls.enabled}
              onCommit={(value) => controls.onPositionChange(axis, value)}
              width={88}
            />
          ))}
          <Button
            disabled={!controls.enabled || key.time === 0}
            onClick={controls.onDelete}
            sx={{ whiteSpace: 'nowrap' }}
          >
            位置を削除
          </Button>
          {key.time === 0 && (
            <Typography variant="caption">開始点は位置のみ編集可能</Typography>
          )}
        </>
      ) : (
        <Typography variant="caption" color="text.secondary">
          ◆を選択して位置を編集。ドラッグ / ← →で時刻変更、Backspaceで削除。
        </Typography>
      )}
    </Stack>
  );
};
