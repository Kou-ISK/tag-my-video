import React, { useRef, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type PlaylistWorkspaceSplitterProps = {
  onRatioChange: (ratio: number) => void;
};

export const clampWorkspaceRatio = (
  ratio: number,
  minimum = 0.2,
  maximum = 0.8,
): number => Math.min(maximum, Math.max(minimum, ratio));

export const PlaylistWorkspaceSplitter = ({
  onRatioChange,
}: PlaylistWorkspaceSplitterProps) => {
  const theme = useTheme();
  const [dragging, setDragging] = useState(false);
  const splitterRef = useRef<HTMLDivElement | null>(null);

  const updateRatio = (clientY: number): void => {
    const splitter = splitterRef.current;
    const review = splitter?.previousElementSibling;
    const workspace = splitter?.nextElementSibling;
    if (!(review instanceof HTMLElement) || !(workspace instanceof HTMLElement)) {
      return;
    }

    const reviewBounds = review.getBoundingClientRect();
    const workspaceBounds = workspace.getBoundingClientRect();
    const availableHeight = workspaceBounds.bottom - reviewBounds.top;
    if (availableHeight <= 0) return;

    onRatioChange(
      clampWorkspaceRatio((clientY - reviewBounds.top) / availableHeight),
    );
  };

  return (
    <Tooltip title="Review / Workspace の境界をドラッグ">
      <Box
        ref={splitterRef}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Review と Workspace のサイズ"
        data-testid="playlist-workspace-splitter"
        onPointerDown={(event) => {
          if (event.currentTarget.setPointerCapture) {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          setDragging(true);
          updateRatio(event.clientY);
        }}
        onPointerMove={(event) => {
          if (dragging) updateRatio(event.clientY);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onLostPointerCapture={() => setDragging(false)}
        sx={{
          flex: '0 0 8px',
          cursor: 'row-resize',
          bgcolor: dragging ? theme.palette.action.selected : 'transparent',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          '&:hover': { bgcolor: theme.palette.action.hover },
        }}
      />
    </Tooltip>
  );
};
