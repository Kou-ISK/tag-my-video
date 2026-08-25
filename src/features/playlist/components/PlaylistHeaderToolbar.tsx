import React from 'react';
import {
  IconButton,
  Box,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  ListItemIcon,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import FolderOpen from '@mui/icons-material/FolderOpen';
import MoreVert from '@mui/icons-material/MoreVert';
import Outbox from '@mui/icons-material/Outbox';
import PlaylistPlay from '@mui/icons-material/PlaylistPlay';
import Save from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { PlaylistWorkspaceMode } from '../../../types/playlist/window';

type ViewMode = 'angle1' | 'angle2' | 'dual';

type PlaylistHeaderToolbarProps = {
  playlistName: string;
  hasUnsavedChanges: boolean;
  exportDisabled: boolean;
  hasDualSources: boolean;
  anchorEl: HTMLElement | null;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onSaveClick: () => void;
  onSaveAsClick: () => void;
  onLoadClick: () => void;
  onExportClick: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  workspaceMode: PlaylistWorkspaceMode;
  onWorkspaceModeChange: (mode: PlaylistWorkspaceMode) => void;
  inspectorVisible: boolean;
  onInspectorToggle: () => void;
};

export const PlaylistHeaderToolbar = ({
  playlistName,
  hasUnsavedChanges,
  exportDisabled,
  hasDualSources,
  anchorEl,
  onMenuOpen,
  onMenuClose,
  onSaveClick,
  onSaveAsClick,
  onLoadClick,
  onExportClick,
  onViewModeChange,
  workspaceMode,
  onWorkspaceModeChange,
  inspectorVisible,
  onInspectorToggle,
}: PlaylistHeaderToolbarProps) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
        px: 1.5,
        py: 0.5,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <PlaylistPlay sx={{ color: theme.palette.primary.main }} />
        <Typography variant="subtitle2" sx={{ flex: 1 }}>
          {playlistName}
        </Typography>

        {hasUnsavedChanges ? (
          <Tooltip title="未保存の変更">
            <Box
              component="span"
              aria-label="未保存の変更"
              sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main' }}
            />
          </Tooltip>
        ) : null}

        <ToggleButtonGroup
          size="small"
          exclusive
          value={workspaceMode}
          onChange={(_, value: PlaylistWorkspaceMode | null) => {
            if (value) onWorkspaceModeChange(value);
          }}
          aria-label="Playlist workspace view"
        >
          <ToggleButton value="organizer" aria-label="Organizer">
            Organizer
          </ToggleButton>
          <ToggleButton value="sorter" aria-label="Sorter">
            Sorter
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={inspectorVisible ? 'Inspectorを閉じる' : 'Inspectorを開く'}>
          <IconButton size="small" onClick={onInspectorToggle} aria-label="Inspector">
            {inspectorVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip
          title={`保存 (Cmd+S)${hasUnsavedChanges ? ' - 未保存の変更あり' : ''}`}
        >
          <IconButton
            size="small"
            onClick={onSaveClick}
            sx={{
              color: hasUnsavedChanges ? 'warning.main' : 'text.secondary',
              '&:hover': {
                bgcolor: alpha(theme.palette.action.hover, 0.08),
              },
            }}
          >
            <Save fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="エクスポート (Cmd+E)">
          <IconButton
            size="small"
            onClick={onExportClick}
            disabled={exportDisabled}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.08) },
            }}
          >
            <Outbox fontSize="small" />
          </IconButton>
        </Tooltip>

        <IconButton size="small" onClick={onMenuOpen}>
          <MoreVert fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onMenuClose}>
          <MenuItem
            onClick={() => {
              onMenuClose();
              onSaveAsClick();
            }}
          >
            <ListItemIcon>
              <Save fontSize="small" />
            </ListItemIcon>
            名前を付けて保存...
          </MenuItem>
          <MenuItem
            onClick={() => {
              onMenuClose();
              onLoadClick();
            }}
          >
            <ListItemIcon>
              <FolderOpen fontSize="small" />
            </ListItemIcon>
            プレイリストを開く
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              onMenuClose();
              onViewModeChange('angle1');
            }}
            disabled={!hasDualSources}
          >
            <ListItemIcon>
              <Typography variant="caption">⇧1</Typography>
            </ListItemIcon>
            アングル1のみ
          </MenuItem>
          <MenuItem
            onClick={() => {
              onMenuClose();
              onViewModeChange('angle2');
            }}
            disabled={!hasDualSources}
          >
            <ListItemIcon>
              <Typography variant="caption">⇧2</Typography>
            </ListItemIcon>
            アングル2のみ
          </MenuItem>
          <MenuItem
            onClick={() => {
              onMenuClose();
              onViewModeChange('dual');
            }}
            disabled={!hasDualSources}
          >
            <ListItemIcon>
              <Typography variant="caption"> </Typography>
            </ListItemIcon>
            デュアルビュー
          </MenuItem>
        </Menu>
      </Stack>
    </Paper>
  );
};
