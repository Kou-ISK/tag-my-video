import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { PlaylistReviewView } from '../components/PlaylistReviewView';
import { StudioCanvasView } from './StudioCanvasView';
import { StudioSidebarView } from './StudioSidebarView';
import { StudioTransportView } from './StudioTransportView';
import { useStudioEditor } from './useStudioEditor';
import { studioObjects } from '../fixtures/studio';
import type { DrawingObject } from '../../../types/playlist/core';

const StudioFixture = ({
  empty = false,
}: {
  empty?: boolean;
}): ReactElement => {
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 450 });
  const [history, setHistory] = useState<DrawingObject[][]>([
    empty ? [] : studioObjects,
  ]);
  const [cursor, setCursor] = useState(0);
  const [time, setTime] = useState(12);
  const [freeze, setFreeze] = useState(3);
  useLayoutEffect(() => {
    const media = root.current?.querySelector('[data-studio-media]');
    if (!media) return;
    const observer = new ResizeObserver(() =>
      setSize({ width: media.clientWidth, height: media.clientHeight }),
    );
    observer.observe(media);
    return () => observer.disconnect();
  }, []);
  const editor = useStudioEditor({
    documentKey: 'fixture-primary',
    enabled: !empty,
    objects: history[cursor],
    time,
    target: 'primary',
    ...size,
    contentRect: { ...size, offsetX: 0, offsetY: 0 },
    onCommit: (objects) => {
      setHistory([...history.slice(0, cursor + 1), objects]);
      setCursor(cursor + 1);
    },
    onSeek: setTime,
    canUndo: cursor > 0,
    canRedo: cursor < history.length - 1,
    onUndo: () => setCursor(Math.max(0, cursor - 1)),
    onRedo: () => setCursor(Math.min(history.length - 1, cursor + 1)),
  });
  return (
    <Box ref={root} sx={{ height: '100vh', minHeight: 480 }}>
      <PlaylistReviewView
        inspector={
          <StudioSidebarView
            {...{
              ...editor.inspector,
              target: 'primary',
              hasSecondary: false,
              onTargetChange: () => {},
            }}
          />
        }
        transport={
          <StudioTransportView
            {...{
              time,
              min: 0,
              max: 30,
              freezeDuration: freeze,
              onFreezeDurationChange: setFreeze,
              playing: false,
              disabled: empty,
              onSeek: setTime,
              onTogglePlay: () => setTime(time === 12 ? 13 : 12),
            }}
          />
        }
        media={
          <>
            <svg
              data-studio-media
              width="100%"
              height="100%"
              viewBox="0 0 800 450"
              preserveAspectRatio="none"
              role="img"
              aria-label="戦術ボードのデモ映像"
            >
              <rect width="800" height="450" fill="#294B3B" />
              <g stroke="#FFFFFF" strokeOpacity="0.4" fill="none">
                <rect x="30" y="30" width="740" height="390" />
                <path d="M400 30V420M150 30V420M650 30V420" />
                <ellipse cx="400" cy="225" rx="55" ry="55" />
              </g>
              <g fill="#F5F5F7" stroke="#202020" strokeWidth="3">
                <circle cx="270" cy="267" r="12" />
                <circle cx="355" cy="340" r="12" />
                <circle cx="540" cy="280" r="12" />
              </g>
              <g fill="#E65757" stroke="#202020" strokeWidth="3">
                <circle cx="410" cy="240" r="12" />
                <circle cx="530" cy="170" r="12" />
                <circle cx="610" cy="350" r="12" />
              </g>
              <text x="40" y="55" fill="#FFFFFF" fontSize="12">
                STUDIO · FIXTURE
              </text>
            </svg>
            <StudioCanvasView {...editor.canvas} />
          </>
        }
      />
    </Box>
  );
};
const meta: Meta<typeof PlaylistReviewView> = {
  title: 'Workspace/Playlist/Studio',
  component: PlaylistReviewView,
  render: () => <StudioFixture />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};
export const Empty: Story = { render: () => <StudioFixture empty /> };
