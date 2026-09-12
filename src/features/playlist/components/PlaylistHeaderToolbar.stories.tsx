import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PlaylistWorkspaceMode } from '../../../types/playlist/window';
import { PlaylistHeaderToolbar } from './PlaylistHeaderToolbar';
const meta = {
  title: 'Workspace/Playlist/Toolbar',
  component: PlaylistHeaderToolbar,
  args: {
    playlistName: '決勝戦｜チームレビュー',
    hasUnsavedChanges: false,
    exportDisabled: false,
    hasDualSources: true,
    anchorEl: null,
    onMenuOpen: () => {},
    onMenuClose: () => {},
    onSaveClick: () => {},
    onSaveAsClick: () => {},
    onLoadClick: () => {},
    onExportClick: () => {},
    onViewModeChange: () => {},
    workspaceMode: 'organizer',
    onWorkspaceModeChange: () => {},
    inspectorVisible: true,
    onInspectorToggle: () => {},
  },
} satisfies Meta<typeof PlaylistHeaderToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  render: function Render(args) {
    const [mode, setMode] = useState<PlaylistWorkspaceMode>('organizer');
    const [inspector, setInspector] = useState(true);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
      <PlaylistHeaderToolbar
        {...args}
        workspaceMode={mode}
        onWorkspaceModeChange={setMode}
        inspectorVisible={inspector}
        onInspectorToggle={() => setInspector(!inspector)}
        anchorEl={anchor}
        onMenuOpen={(event) => setAnchor(event.currentTarget)}
        onMenuClose={() => setAnchor(null)}
      />
    );
  },
};
export const Unsaved: Story = {
  args: {
    hasUnsavedChanges: true,
    playlistName:
      '長い試合名称｜ディフェンスからアタックへの切り替えを確認するレビュー',
  },
};
export const Empty: Story = {
  args: { exportDisabled: true, hasDualSources: false },
};
