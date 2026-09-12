// @vitest-environment jsdom
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useStudioRulerInput } from './useStudioRulerInput';

const Fixture = ({
  time,
  seek,
}: {
  time: number;
  seek: (time: number) => void;
}): React.ReactElement => {
  const input = useStudioRulerInput(time, seek);
  return (
    <input
      aria-label="seek"
      type="range"
      min={0}
      max={10}
      step={0.01}
      defaultValue={time}
      ref={input.inputRef}
      onChange={input.onChange}
    />
  );
};
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('coalesces rapid input without losing the final position and synchronizes playback', () => {
  let next: FrameRequestCallback = () => {};
  const schedule = vi.fn((callback: FrameRequestCallback) => {
    next = callback;
    return 1;
  });
  vi.stubGlobal('requestAnimationFrame', schedule);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  const seek = vi.fn();
  const view = render(<Fixture time={0} seek={seek} />);
  const input = view.getByRole('slider');
  fireEvent.change(input, { target: { value: '1' } });
  fireEvent.change(input, { target: { value: '2' } });
  view.rerender(<Fixture time={0.5} seek={seek} />);
  expect(input).toHaveProperty('value', '2');
  expect(schedule).toHaveBeenCalledTimes(1);
  expect(seek).not.toHaveBeenCalled();
  act(() => next(16));
  expect(seek).toHaveBeenCalledExactlyOnceWith(2);
  view.rerender(<Fixture time={3} seek={seek} />);
  expect(input).toHaveProperty('value', '3');
  view.unmount();
});
it('cancels pending seeking when the ruler is removed', () => {
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 7),
  );
  const cancel = vi.fn();
  vi.stubGlobal('cancelAnimationFrame', cancel);
  const view = render(<Fixture time={0} seek={vi.fn()} />);
  fireEvent.change(view.getByRole('slider'), { target: { value: '2' } });
  view.unmount();
  expect(cancel).toHaveBeenCalledWith(7);
});
