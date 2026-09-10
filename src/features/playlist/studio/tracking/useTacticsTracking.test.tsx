// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTacticsTracking } from './useTacticsTracking';
import { trackAnnotation } from './trackAnnotation';
import type { TrackingResult } from './trackAnnotation';
import type { DrawingObject } from '../../../../types/playlist/core';
vi.mock('./trackAnnotation', () => ({ trackAnnotation: vi.fn() }));
const selected: DrawingObject = {
  id: 'a',
  type: 'rectangle',
  timestamp: 0,
  startX: 30,
  startY: 30,
  endX: 50,
  endY: 50,
  color: '#fff',
  strokeWidth: 2,
};
const tracked: TrackingResult = {
  object: {
    ...selected,
    motion: {
      duration: 1,
      keyframes: [
        { time: 0, x: 0, y: 0 },
        { time: 1, x: 10, y: 0 },
      ],
    },
  },
  confidence: 1,
  trackedDuration: 1,
  lost: false,
};
describe('tracking application', () => {
  beforeEach(() => vi.clearAllMocks());
  it('automatically commits a successful track once', async () => {
    vi.mocked(trackAnnotation).mockResolvedValue(tracked);
    const onApply = vi.fn();
    const { result } = renderHook(() =>
      useTacticsTracking({
        documentKey: 'clip',
        source: () => 'video',
        selected,
        enabled: true,
        time: 0,
        endTime: 2,
        onApply,
      }),
    );
    act(() => result.current.onStart());
    expect(trackAnnotation).not.toHaveBeenCalled();
    act(() => result.current.targetSelection?.onBegin(0.1, 0.2));
    act(() => result.current.targetSelection?.onMove(0.2, 0.4));
    await act(async () => result.current.targetSelection?.onConfirm());
    expect(onApply).toHaveBeenCalledExactlyOnceWith(tracked.object);
    expect(result.current.hasResult).toBe(false);
  });
  it('does not overwrite edits made while analysis is pending', async () => {
    let finish: (value: TrackingResult) => void = () => {};
    vi.mocked(trackAnnotation).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const onApply = vi.fn();
    const { result, rerender } = renderHook(
      ({ object }) =>
        useTacticsTracking({
          documentKey: 'clip',
          source: () => 'video',
          selected: object,
          enabled: true,
          time: 0,
          endTime: 2,
          onApply,
        }),
      { initialProps: { object: selected } },
    );
    act(() => result.current.onStart());
    act(() => result.current.targetSelection?.onBegin(0.1, 0.2));
    act(() => result.current.targetSelection?.onMove(0.2, 0.4));
    act(() => result.current.targetSelection?.onConfirm());
    rerender({ object: { ...selected, startX: 70 } });
    await act(async () => finish(tracked));
    expect(onApply).not.toHaveBeenCalled();
    expect(result.current.message).toContain('破棄');
  });
  it('keeps partial tracking explicit and reports unavailable video', async () => {
    vi.mocked(trackAnnotation).mockResolvedValue({ ...tracked, lost: true });
    const onApply = vi.fn();
    const { result, rerender } = renderHook(
      ({ source }) =>
        useTacticsTracking({
          documentKey: 'clip',
          source,
          selected,
          enabled: true,
          time: 0,
          endTime: 2,
          onApply,
        }),
      { initialProps: { source: (): string | undefined => 'video' } },
    );
    act(() => result.current.onStart());
    expect(trackAnnotation).not.toHaveBeenCalled();
    act(() => result.current.targetSelection?.onBegin(0.1, 0.2));
    act(() => result.current.targetSelection?.onMove(0.2, 0.4));
    await act(async () => result.current.targetSelection?.onConfirm());
    expect(onApply).not.toHaveBeenCalled();
    expect(result.current.hasResult).toBe(true);
    rerender({ source: () => undefined });
    act(() => result.current.onStart());
    act(() => result.current.targetSelection?.onBegin(0.1, 0.2));
    act(() => result.current.targetSelection?.onMove(0.2, 0.4));
    act(() => result.current.targetSelection?.onConfirm());
    expect(result.current.message).toContain('読み込めません');
  });
});
