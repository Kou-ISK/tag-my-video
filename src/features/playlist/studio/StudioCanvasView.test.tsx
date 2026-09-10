// @vitest-environment jsdom
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { StudioCanvasView } from './StudioCanvasView';
it('uses video dimensions for the drawing buffer, not the canvas default 300x150', () => {
  render(
    <StudioCanvasView
      canvasRef={createRef<HTMLCanvasElement>()}
      width={1280}
      height={720}
      enabled
      tool="arrow"
      onKeyDown={vi.fn()}
      onPointerDown={vi.fn()}
      onPointerMove={vi.fn()}
      onPointerUp={vi.fn()}
      onPointerCancel={vi.fn()}
      onLostPointerCapture={vi.fn()}
    />,
  );
  const canvas = screen.getByLabelText('Tactics 描画キャンバス');
  expect(canvas).toHaveProperty('width', 1280);
  expect(canvas).toHaveProperty('height', 720);
});
