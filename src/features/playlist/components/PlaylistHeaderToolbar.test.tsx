// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlaylistHeaderToolbar } from './PlaylistHeaderToolbar';

const buildProps = () => ({
  playlistName: 'Game Review',
  hasUnsavedChanges: false,
  exportDisabled: false,
  hasDualSources: true,
  anchorEl: null,
  onMenuOpen: vi.fn(),
  onMenuClose: vi.fn(),
  onSaveClick: vi.fn(),
  onSaveAsClick: vi.fn(),
  onLoadClick: vi.fn(),
  onExportClick: vi.fn(),
  onViewModeChange: vi.fn(),
  workspaceMode: 'organizer' as const,
  onWorkspaceModeChange: vi.fn(),
  inspectorVisible: true,
  onInspectorToggle: vi.fn(),
});

describe('PlaylistHeaderToolbar', () => {
  afterEach(() => cleanup());

  it('switches workspace views without routing through save/dirty actions', () => {
    const props = buildProps();
    render(<PlaylistHeaderToolbar {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sorter' }));

    expect(props.onWorkspaceModeChange).toHaveBeenCalledWith('sorter');
    expect(props.onSaveClick).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('未保存の変更')).toBeNull();
  });

  it('keeps inspector visibility as an independent shell control', () => {
    const props = buildProps();
    render(<PlaylistHeaderToolbar {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Inspector' }));

    expect(props.onInspectorToggle).toHaveBeenCalledTimes(1);
  });
});
