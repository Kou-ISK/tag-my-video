// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { StudioNumberFieldView } from './StudioNumberFieldView';

afterEach(cleanup);
it('keeps empty, unchanged and cancelled drafts out of saved position/history', () => {
  const onCommit = vi.fn();
  render(
    <StudioNumberFieldView
      label="位置"
      value={25}
      disabled={false}
      width={88}
      onCommit={onCommit}
    />,
  );
  const input = screen.getByRole('spinbutton');
  fireEvent.blur(input);
  fireEvent.change(input, { target: { value: '' } });
  fireEvent.blur(input);
  expect(input.getAttribute('value')).toBe('25');
  fireEvent.change(input, { target: { value: '75' } });
  fireEvent.keyDown(input, { key: 'Escape' });
  fireEvent.blur(input);
  expect(onCommit).not.toHaveBeenCalled();
  expect(input.getAttribute('value')).toBe('25');
});
it('commits zero or another finite value once with Enter or blur', () => {
  const onCommit = vi.fn();
  render(
    <StudioNumberFieldView
      label="位置"
      value={25}
      disabled={false}
      width={88}
      onCommit={onCommit}
    />,
  );
  const input = screen.getByRole('spinbutton');
  fireEvent.change(input, { target: { value: '0' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.blur(input);
  expect(onCommit).toHaveBeenCalledExactlyOnceWith(0);
  fireEvent.change(input, { target: { value: '-12.5' } });
  fireEvent.blur(input);
  expect(onCommit).toHaveBeenLastCalledWith(-12.5);
});
