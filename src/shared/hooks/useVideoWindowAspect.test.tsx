// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useVideoWindowAspect } from './useVideoWindowAspect';
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});
it('excludes the measured chrome, deduplicates resize events and releases the constraint', () => {
  vi.useFakeTimers();
  const update = vi.fn();
  Object.defineProperty(window, 'electronAPI', {
    configurable: true,
    value: { setVideoWindowAspect: update },
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe(): void {}
      disconnect(): void {}
    },
  );
  const root = document.createElement('div');
  const media = document.createElement('div');
  media.dataset.videoAspectSurface = '';
  root.append(media);
  document.body.append(root);
  vi.spyOn(media, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 640, 360),
  );
  const ref = { current: root };
  const { unmount, rerender } = renderHook(
    ({ fraction }) => useVideoWindowAspect(ref, 'single', 16 / 9, fraction),
    { initialProps: { fraction: 1 } },
  );
  act(() => vi.advanceTimersByTime(110));
  expect(update).toHaveBeenCalledExactlyOnceWith({
    aspectRatio: 16 / 9,
    width: innerWidth - 640,
    height: innerHeight - 360,
  });
  act(() => {
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(110);
  });
  expect(update).toHaveBeenCalledTimes(1);
  rerender({ fraction: 0.5 });
  act(() => vi.advanceTimersByTime(110));
  expect(update).toHaveBeenLastCalledWith({
    aspectRatio: 8 / 9,
    width: innerWidth - 640,
    height: innerHeight - 720,
  });
  unmount();
  expect(update).toHaveBeenLastCalledWith(null);
  Reflect.deleteProperty(window, 'electronAPI');
});
