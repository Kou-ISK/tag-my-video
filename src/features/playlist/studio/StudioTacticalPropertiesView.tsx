import type { ReactElement } from 'react';
import { Stack, TextField, Typography } from '@mui/material';
import type { DrawingObject } from '../../../types/playlist/core';

export const StudioTacticalPropertiesView = ({
  object,
  onUpdate,
}: {
  object: DrawingObject;
  onUpdate: (patch: Partial<DrawingObject>) => void;
}): ReactElement => (
  <Stack spacing={1.5}>
    {object.type === 'curvedArrow' && (
      <TextField
        type="number"
        label="曲がり %"
        value={Math.round((object.curvature ?? -0.25) * 100)}
        slotProps={{ htmlInput: { min: -100, max: 100, step: 5 } }}
        onChange={(event) => {
          const value = Number(event.target.value);
          if (Number.isFinite(value) && Math.abs(value) <= 100)
            onUpdate({ curvature: value / 100, path: undefined });
        }}
      />
    )}
    {['disc', 'beam'].includes(object.type) && (
      <TextField
        label="選手名・背番号"
        value={object.text ?? ''}
        onChange={(event) => onUpdate({ text: event.target.value })}
      />
    )}
    {object.type === 'linkedDiscs' && (
      <>
        <Typography variant="caption" color="text.secondary">
          映像上の白い点をドラッグして、各選手の足元へ配置できます。
        </Typography>
        <TextField
          type="number"
          label="選手数"
          value={object.path?.length ?? 0}
          slotProps={{ htmlInput: { min: 2, max: 11 } }}
          onChange={(event) => {
            const count = Number(event.target.value);
            if (
              !Number.isInteger(count) ||
              count < 2 ||
              count > 11 ||
              !object.path?.length
            )
              return;
            const path = [...object.path];
            while (path.length < count) {
              const last = path[path.length - 1];
              path.push({
                x: Math.min(object.baseWidth ?? 10000, last.x + 40),
                y: last.y,
              });
            }
            onUpdate({ path: path.slice(0, count) });
          }}
        />
        <TextField
          type="number"
          label="ディスク半径"
          value={object.discRadius ?? 22}
          slotProps={{ htmlInput: { min: 4, max: 100 } }}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value) && value >= 4 && value <= 100)
              onUpdate({ discRadius: value });
          }}
        />
      </>
    )}
  </Stack>
);
