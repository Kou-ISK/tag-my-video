// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { expect, it, vi } from 'vitest';
import { useStudioKeyframes } from './useStudioKeyframes';
import type { DrawingObject } from '../../../types/playlist/core';
const object: DrawingObject = {
  id: 'a',
  type: 'disc',
  startX: 10,
  startY: 20,
  color: '#fff',
  strokeWidth: 2,
  timestamp: 10,
  motion: {
    duration: 3,
    keyframes: [
      { time: 0, x: 0, y: 0 },
      { time: 1, x: 20, y: 10 },
      { time: 2, x: 50, y: 30 },
    ],
  },
};
it('edits time independently of position, preserves order, deletes only a key, and protects the origin', () => {
  const seek = vi.fn();
  const { result } = renderHook(() => {
    const [objects, commit] = useState([object]);
    const controls = useStudioKeyframes({
      documentKey: 'clip',
      objects,
      selectedId: 'a',
      enabled: true,
      onSelectObject: vi.fn(),
      onCommit: commit,
      onSeek: seek,
    });
    return { controls, objects };
  });
  act(() => result.current.controls.onSelect('a', 1));
  act(() => result.current.controls.onMove(11.5));
  expect(result.current.objects[0].motion?.keyframes[1]).toEqual({
    time: 1.5,
    x: 20,
    y: 10,
  });
  act(() => result.current.controls.onMove(20));
  expect(result.current.controls.selected?.time).toBe(1.999);
  act(() => result.current.controls.onPositionChange('x', 100));
  expect(result.current.objects[0].motion?.keyframes[1].x).toBe(100);
  act(() => result.current.controls.onDelete());
  expect(result.current.objects).toHaveLength(1);
  expect(result.current.objects[0].motion?.keyframes).toHaveLength(2);
  expect(result.current.controls.selected?.time).toBe(0);
  act(() => result.current.controls.onDelete());
  act(() => result.current.controls.onMove(12));
  expect(result.current.objects[0].motion?.keyframes[0]).toEqual({
    time: 0,
    x: 0,
    y: 0,
  });
});
it('does not apply a stale selection to a different document or disabled editor', () => {
  const commit = vi.fn();
  const { result, rerender } = renderHook(
    ({ documentKey, enabled }) =>
      useStudioKeyframes({
        documentKey,
        enabled,
        objects: [object],
        selectedId: 'a',
        onSelectObject: vi.fn(),
        onCommit: commit,
        onSeek: vi.fn(),
      }),
    { initialProps: { documentKey: 'one', enabled: true } },
  );
  act(() => result.current.onSelect('a', 1));
  rerender({ documentKey: 'two', enabled: true });
  act(() => result.current.onDelete());
  expect(commit).not.toHaveBeenCalled();
  act(() => result.current.onSelect('a', 1));
  rerender({ documentKey: 'two', enabled: false });
  act(() => result.current.onDelete());
  expect(commit).not.toHaveBeenCalled();
});
