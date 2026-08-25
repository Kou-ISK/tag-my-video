// @vitest-environment jsdom

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ItemAnnotation, PlaylistItem } from '../../../../types/playlist/core';
import { usePlaylistVideoControlsState } from './usePlaylistVideoControlsState';

const item: PlaylistItem = {
  id: 'clip-1',
  timelineItemId: null,
  actionName: 'Scrum',
  startTime: 10,
  endTime: 20,
  addedAt: 0,
};

describe('usePlaylistVideoControlsState', () => {
  it('exposes drawing timestamps as seekbar reference marks', () => {
    const annotation: ItemAnnotation = {
      objects: [
        { id: 'drawing-1', type: 'pen', color: '#fff', strokeWidth: 2, startX: 0, startY: 0, timestamp: 12.5 },
        { id: 'drawing-2', type: 'arrow', color: '#fff', strokeWidth: 2, startX: 0, startY: 0, timestamp: 18 },
      ],
      freezeDuration: 0,
      freezeAt: 0,
    };
    const { result } = renderHook(() => usePlaylistVideoControlsState({
      currentItem: item,
      currentAnnotation: annotation,
      duration: 30,
      autoAdvance: true,
      loopPlaylist: false,
      isMuted: false,
      setAutoAdvance: vi.fn(),
      setLoopPlaylist: vi.fn(),
      setIsMuted: vi.fn(),
    }));

    expect(result.current.marks.map((mark) => mark.value)).toEqual([12.5, 18]);
    expect(result.current.sliderMin).toBe(10);
    expect(result.current.sliderMax).toBe(20);
  });
});
