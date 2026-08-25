import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { PlaylistWindowController } from '../hooks/playlist/usePlaylistWindowController';
import { PlaylistHeaderToolbar } from './PlaylistHeaderToolbar';
import { PlaylistItemSection } from './PlaylistItemSection';
import { PlaylistVideoArea } from './PlaylistVideoArea';
import { PlaylistWindowDialogs } from './PlaylistWindowDialogs';
import { PlaylistClipInspector } from './PlaylistClipInspector';
import { PlaylistWorkspaceSplitter } from './PlaylistWorkspaceSplitter';
import { PlaylistSorterView } from './PlaylistSorterView';
import { PlaylistOrganizerView } from './PlaylistOrganizerView';

type PlaylistWindowViewProps = {
  controller: PlaylistWindowController;
};

export const PlaylistWindowView = ({
  controller,
}: PlaylistWindowViewProps) => {
  const theme = useTheme();

  return (
    <Box
      ref={controller.containerRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <PlaylistHeaderToolbar {...controller.header} />

      <Box
        data-testid="playlist-review-area"
        sx={{
          display: 'flex',
          minHeight: 220,
          flex: `0 0 ${controller.shell.workspaceRatio * 100}%`,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex' }}>
          <PlaylistVideoArea {...controller.videoArea} />
        </Box>
        {controller.shell.inspectorVisible ? (
          <PlaylistClipInspector {...controller.inspector} />
        ) : null}
      </Box>

      <PlaylistWorkspaceSplitter
        onRatioChange={controller.shell.onWorkspaceRatioChange}
      />

      <Box
        component="section"
        data-testid="playlist-workspace"
        aria-label={`${controller.shell.workspaceMode} workspace`}
        sx={{
          minHeight: 160,
          flex: 1,
          overflow: 'auto',
          bgcolor: theme.palette.background.default,
        }}
      >
        {controller.shell.workspaceMode === 'sorter' ? (
          <PlaylistSorterView {...controller.sorter} />
        ) : controller.shell.workspaceMode === 'organizer' ? (
          <PlaylistOrganizerView {...controller.organizer} />
        ) : (
          <PlaylistItemSection {...controller.itemSection} />
        )}
      </Box>

      <PlaylistWindowDialogs {...controller.dialogs} />
    </Box>
  );
};
