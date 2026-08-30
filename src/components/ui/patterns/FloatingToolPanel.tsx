import type {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import {
  Paper,
  Portal,
  type PaperProps,
  type SxProps,
  type Theme,
} from '@mui/material';

export interface FloatingToolPanelProps
  extends Omit<PaperProps, 'children' | 'sx'> {
  children: ReactNode;
  panelRef?: Ref<HTMLDivElement>;
  position?: { x: number; y: number };
  isDragging?: boolean;
  onDragStart?: MouseEventHandler<HTMLDivElement>;
  label: string;
  portal?: boolean;
  sx?: SxProps<Theme>;
}

/** Shared overlay surface for annotation, playback and inspector tools. */
export const FloatingToolPanel = ({
  children,
  panelRef,
  position,
  isDragging = false,
  onDragStart,
  label,
  portal = true,
  sx,
  ...paperProps
}: FloatingToolPanelProps): ReactElement => {
  const baseSx = (theme: Theme) => ({
    position: 'fixed' as const,
    top: position ? position.y : 'auto',
    left: position ? position.x : 'auto',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.custom.tokens.surface.overlay,
    color: theme.custom.tokens.content.primary,
    border: `1px solid ${theme.custom.tokens.border.subtle}`,
    boxShadow: theme.custom.elevation.overlay,
    borderRadius: theme.shape.borderRadius,
    zIndex: theme.custom.zIndex.floatingToolbar,
    cursor: isDragging ? 'grabbing' : 'default',
    userSelect: 'none' as const,
  });
  const mergedSx: SxProps<Theme> = sx
    ? [baseSx, ...(Array.isArray(sx) ? sx : [sx])]
    : baseSx;
  const panel = (
    <Paper
      {...paperProps}
      ref={panelRef}
      role="toolbar"
      aria-label={label}
      onMouseDown={onDragStart}
      sx={mergedSx}
    >
      {children}
    </Paper>
  );

  return portal ? <Portal>{panel}</Portal> : panel;
};
