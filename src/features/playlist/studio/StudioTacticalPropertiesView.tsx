import { StudioPlayerCountView } from './StudioPlayerCountView';
import { resizeLinkedDiscPath } from './linkedDiscLayout';
import type { ReactElement } from 'react';
import { Stack, TextField } from '@mui/material';
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
        <StudioPlayerCountView
          count={object.path?.length ?? 2}
          onChange={(count) =>
            onUpdate({ path: resizeLinkedDiscPath(object, count) })
          }
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
