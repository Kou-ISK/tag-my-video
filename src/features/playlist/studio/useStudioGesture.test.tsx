// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PointerEvent } from 'react';
import { useStudioGesture } from './useStudioGesture';

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 450;
canvas.getBoundingClientRect = () => new DOMRect(10, 20, 800, 450);
canvas.setPointerCapture = vi.fn();
canvas.releasePointerCapture = vi.fn();
canvas.hasPointerCapture = () => true;
const pointer = (x: number, y: number): PointerEvent<HTMLCanvasElement> =>
  ({
    currentTarget: canvas,
    clientX: x + 10,
    clientY: y + 20,
    button: 0,
    pointerId: 1,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as PointerEvent<HTMLCanvasElement>; // Minimal synthetic event for the hook's pointer boundary.

describe('Studio gesture transactions', () => {
  it('commits one history entry per drag using content coordinates', () => {
    const commit = vi.fn();
    const { result } = renderHook(() =>
      useStudioGesture({
        documentKey: 'clip1',
        enabled: true,
        canvasRef: { current: canvas },
        contentRect: { width: 700, height: 400, offsetX: 50, offsetY: 25 },
        objects: [],
        tool: 'arrow',
        color: '#ffffff',
        strokeWidth: 4,
        opacity: 1,
        fill: false,
        dashed: false,
        time: 10,
        target: 'primary',
        selectedId: null,
        onSelect: vi.fn(),
        onCommit: commit,
      }),
    );
    act(() => result.current.handlers.onPointerDown(pointer(100, 100)));
    act(() => result.current.handlers.onPointerMove(pointer(200, 200)));
    act(() => result.current.handlers.onPointerMove(pointer(250, 225)));
    expect(commit).not.toHaveBeenCalled();
    act(() => result.current.handlers.onPointerUp(pointer(250, 225)));
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit.mock.calls[0][0][0]).toMatchObject({
      startX: 50,
      startY: 75,
      endX: 200,
      endY: 200,
      timestamp: 10,
      baseWidth: 700,
      baseHeight: 400,
    });
  });
  it('discards unfinished drawing after the clip changes or pointer cancels', () => {
    const commit = vi.fn();
    const { result, rerender } = renderHook(
      ({ key }) =>
        useStudioGesture({
          documentKey: key,
          enabled: true,
          canvasRef: { current: canvas },
          contentRect: { width: 800, height: 450, offsetX: 0, offsetY: 0 },
          objects: [],
          tool: 'rectangle',
          color: '#ffffff',
          strokeWidth: 4,
          opacity: 1,
          fill: false,
          dashed: false,
          time: 10,
          target: 'primary',
          selectedId: null,
          onSelect: vi.fn(),
          onCommit: commit,
        }),
      { initialProps: { key: 'one' } },
    );
    act(() => result.current.handlers.onPointerDown(pointer(100, 100)));
    act(() => result.current.handlers.onPointerMove(pointer(250, 225)));
    rerender({ key: 'two' });
    act(() => result.current.handlers.onPointerUp(pointer(250, 225)));
    expect(commit).not.toHaveBeenCalled();
    act(() => result.current.handlers.onPointerDown(pointer(100, 100)));
    act(() => result.current.handlers.onPointerMove(pointer(250, 225)));
    act(() => result.current.handlers.onPointerCancel());
    act(() => result.current.handlers.onPointerUp(pointer(250, 225)));
    expect(commit).not.toHaveBeenCalled();
  });
});
