// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { expect, it, vi } from 'vitest';
import { useStudioEditor } from './useStudioEditor';
import { useGlobalHotkeys } from '../../../hooks/useGlobalHotkeys';
import { usePlaylistHotkeys } from '../hooks/playlist/usePlaylistHotkeys';
import type { DrawingObject } from '../../../types/playlist/core';
vi.mock('../hooks/annotation/useAnnotationCanvasRendering', () => ({
  useAnnotationCanvasRendering: () => '',
}));
const initial: DrawingObject = {
  id: 'a',
  type: 'disc',
  startX: 20,
  startY: 30,
  color: '#fff',
  strokeWidth: 2,
  timestamp: 0,
  motion: {
    duration: 2,
    keyframes: [
      { time: 0, x: 0, y: 0 },
      { time: 1, x: 30, y: 20 },
    ],
  },
};
const clipDelete = vi.fn();
const Fixture = ({ enabled = true }: { enabled?: boolean }): ReactElement => {
  const [objects, onCommit] = useState([initial]);
  const [time, onSeek] = useState(0);
  const editor = useStudioEditor({
    enabled,
    objects,
    onCommit,
    time,
    onSeek,
    documentKey: 'clip',
    target: 'primary',
    width: 800,
    height: 450,
    contentRect: { width: 800, height: 450, offsetX: 0, offsetY: 0 },
    canUndo: false,
    canRedo: false,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
  });
  useGlobalHotkeys(usePlaylistHotkeys(true), { 'delete-item': clipDelete });
  return (
    <div data-testid="paint" onKeyDown={editor.inspector.onKeyDown}>
      <button onClick={() => editor.inspector.onSelect('a')}>object</button>
      <button onClick={() => editor.keyframes.onSelect('a', 1)}>key</button>
      <input aria-label="text" defaultValue="name" />
      <output data-testid="state">{JSON.stringify(objects)}</output>
    </div>
  );
};
it('routes Backspace to the selected key or object without deleting the clip', () => {
  clipDelete.mockClear();
  const { unmount } = render(<Fixture />);
  fireEvent.click(screen.getByText('key'));
  fireEvent.keyDown(screen.getByTestId('paint'), { key: 'Backspace' });
  let objects = JSON.parse(screen.getByTestId('state').textContent ?? '[]');
  expect(objects).toHaveLength(1);
  expect(objects[0].motion.keyframes).toHaveLength(1);
  fireEvent.keyDown(screen.getByTestId('paint'), {
    key: 'Backspace',
    repeat: true,
  });
  expect(
    JSON.parse(screen.getByTestId('state').textContent ?? '[]'),
  ).toHaveLength(1);
  fireEvent.click(screen.getByText('object'));
  fireEvent.keyDown(screen.getByTestId('paint'), { key: 'Backspace' });
  objects = JSON.parse(screen.getByTestId('state').textContent ?? '[]');
  expect(objects).toHaveLength(0);
  fireEvent.keyDown(window, { key: 'Backspace' });
  expect(clipDelete).not.toHaveBeenCalled();
  unmount();
});
it('preserves text editing and blocks clip deletion while playback disables editing', () => {
  const { unmount } = render(<Fixture enabled={false} />);
  const event = new KeyboardEvent('keydown', {
    key: 'Backspace',
    bubbles: true,
    cancelable: true,
  });
  screen.getByLabelText('text').dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  fireEvent.keyDown(screen.getByTestId('paint'), { key: 'Backspace' });
  fireEvent.keyDown(window, { key: 'Backspace' });
  expect(clipDelete).not.toHaveBeenCalled();
  expect(
    JSON.parse(screen.getByTestId('state').textContent ?? '[]'),
  ).toHaveLength(1);
  unmount();
});
