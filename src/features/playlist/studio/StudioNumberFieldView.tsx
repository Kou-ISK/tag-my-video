import { useState } from 'react';
import type { ReactElement } from 'react';
import { TextField } from '@mui/material';

/** Numeric edits are drafts until Enter/blur; empty or invalid drafts never mean zero. */
export const StudioNumberFieldView = ({
  label,
  value,
  disabled,
  step = 1,
  width,
  onCommit,
}: {
  label: string;
  value: number;
  disabled: boolean;
  step?: number;
  width: number;
  onCommit: (value: number) => void;
}): ReactElement => {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (): void => {
    if (draft !== null && draft.trim() !== '' && !disabled) {
      const next = Number(draft);
      if (Number.isFinite(next) && next !== value) onCommit(next);
    }
    setDraft(null);
  };
  return (
    <TextField
      label={label}
      type="number"
      size="small"
      value={draft ?? value}
      disabled={disabled}
      slotProps={{ htmlInput: { step } }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          if (event.key === 'Enter') commit();
          else setDraft(null);
        }
      }}
      sx={{ width }}
    />
  );
};
