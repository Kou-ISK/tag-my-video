// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PlaylistItem, PlaylistRow } from '../../../types/playlist/core';
import { PlaylistOrganizerView } from './PlaylistOrganizerView';

const makeItem = (id: string, rowId: string, rowOrder: number): PlaylistItem => ({
  id,
  timelineItemId: null,
  actionName: id,
  startTime: 1,
  endTime: 3,
  rowId,
  rowOrder,
  addedAt: 0,
});

describe('PlaylistOrganizerView', () => {
  it('renders row-owned clips and an empty row drop target', () => {
    const rows: PlaylistRow[] = [
      { id: 'attack', name: 'Attack', enabled: true, order: 0 },
      { id: 'defence', name: 'Defence', enabled: true, order: 1 },
    ];
    const onSelectItem = vi.fn();
    const onPlayItem = vi.fn();
    render(
      <PlaylistOrganizerView
        items={[makeItem('clip-1', 'attack', 0)]}
        rows={rows}
        currentIndex={0}
        selectedItemIds={new Set()}
        onSelectItem={onSelectItem}
        onPlayItem={onPlayItem}
      />,
    );

    expect(screen.getByTestId('organizer-row-attack').textContent).toContain('clip-1');
    expect(screen.getByTestId('organizer-empty-row-defence')).toBeTruthy();
    fireEvent.click(screen.getByTestId('organizer-clip-clip-1'));
    fireEvent.doubleClick(screen.getByTestId('organizer-clip-clip-1'));
    expect(onSelectItem).toHaveBeenCalledWith('clip-1', { additive: false, range: false });
    expect(onPlayItem).toHaveBeenCalledWith('clip-1');
  });
});
