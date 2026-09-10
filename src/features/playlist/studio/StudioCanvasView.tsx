import type { ReactElement } from 'react';
import type { StudioEditor } from './useStudioEditor';

export const StudioCanvasView = ({
  canvasRef,
  width,
  height,
  enabled,
  tool,
  ...handlers
}: StudioEditor['canvas']): ReactElement => (
  <canvas
    ref={canvasRef}
    width={Math.round(width)}
    height={Math.round(height)}
    tabIndex={enabled ? 0 : -1}
    aria-label="Studio 描画キャンバス"
    {...handlers}
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      touchAction: 'none',
      pointerEvents: enabled ? 'auto' : 'none',
      cursor: tool === 'select' ? 'default' : 'crosshair',
      outlineOffset: -2,
    }}
  />
);
