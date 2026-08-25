import { describe, expect, it } from 'vitest';
import { getSorterCellValue, sortSorterItems } from './PlaylistSorterView';
import type { PlaylistItem } from '../../../types/playlist/core';

const item = (id: string, duration: number, actionName: string): PlaylistItem => ({
  id,
  timelineItemId: null,
  actionName,
  startTime: 10,
  endTime: 10 + duration,
  addedAt: 0,
});

describe('PlaylistSorterView sorting', () => {
  it('sorts a derived array without changing presentation order', () => {
    const presentation = [item('a', 8, 'Scrum'), item('b', 2, 'Lineout')];
    const sorted = sortSorterItems(presentation, 'duration', 'asc');

    expect(sorted.map((entry) => entry.id)).toEqual(['b', 'a']);
    expect(presentation.map((entry) => entry.id)).toEqual(['a', 'b']);
    expect(getSorterCellValue(presentation[0]!, 'duration')).toBe(8);
  });
});
