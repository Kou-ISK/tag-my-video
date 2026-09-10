import type { ReactElement } from 'react';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, Redo, Undo } from '@mui/icons-material';
import { IconAction } from '../../../components/ui';
import type { StudioEditor } from './useStudioEditor';

type Props = Pick<
  StudioEditor['inspector'],
  | 'inspectorCollapsed'
  | 'onToggleInspector'
  | 'canUndo'
  | 'canRedo'
  | 'enabled'
  | 'onUndo'
  | 'onRedo'
> & { contentId: string };
export const StudioInspectorHeaderView = (props: Props): ReactElement => {
  const label = props.inspectorCollapsed
    ? 'Paintの編集パネルを開く'
    : 'Paintの編集パネルを折りたたむ';
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ p: 0.5, minHeight: 40, flexShrink: 0 }}
    >
      <Tooltip title={label}>
        <IconButton
          size="small"
          aria-label={label}
          aria-expanded={!props.inspectorCollapsed}
          aria-controls={props.contentId}
          onClick={props.onToggleInspector}
        >
          {props.inspectorCollapsed ? (
            <ChevronLeft fontSize="small" />
          ) : (
            <ChevronRight fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      {!props.inspectorCollapsed && (
        <>
          <Typography variant="subtitle2" sx={{ flex: 1, pl: 0.5 }}>
            Paint
          </Typography>
          <IconAction
            label="元に戻す"
            disabled={!props.canUndo || !props.enabled}
            onClick={props.onUndo}
            icon={<Undo fontSize="small" />}
          />
          <IconAction
            label="やり直す"
            disabled={!props.canRedo || !props.enabled}
            onClick={props.onRedo}
            icon={<Redo fontSize="small" />}
          />
        </>
      )}
    </Stack>
  );
};
