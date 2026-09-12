// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { useTimelineHistory } from './useTimelineHistory';
import type { TimelineData } from '../../../../types/timeline/core';
const original: TimelineData[] = [
  { id: 'a', actionName: 'Attack', startTime: 1, endTime: 2, memo: '' },
];
const edited = [{ ...original[0], endTime: 3 }];
afterEach(cleanup);
it('returns the exact document synchronously through batched edit, Undo and Redo', () => {
  const { result } = renderHook(() => useTimelineHistory(original));
  act(() => {
    result.current.setTimeline(edited);
    expect(result.current.undo()).toBe(original);
    expect(result.current.redo()).toBe(edited);
  });
  expect(result.current.timeline).toBe(edited);
  act(() => {
    expect(result.current.undo()).toBe(original);
  });
  expect(result.current.canUndo).toBe(false);
});
it('preserves history on persistence echoes and resets for a different loaded document', () => {
  const { result, rerender } = renderHook(
    ({ input }) => useTimelineHistory(input),
    { initialProps: { input: original } },
  );
  act(() => result.current.setTimeline(edited));
  rerender({ input: structuredClone(edited) });
  act(() => {
    expect(result.current.undo()).toBe(original);
  });
  rerender({ input: structuredClone(original) });
  expect(result.current.canRedo).toBe(true);
  rerender({ input: [] });
  expect(result.current.canRedo).toBe(false);
  expect(result.current.canUndo).toBe(false);
});
