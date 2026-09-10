import { studioInspectorFixture } from '../fixtures/studioInspector';
import { StudioToolsView } from './StudioToolsView';
import { TacticsVideoFixture } from '../fixtures/TacticsVideoFixture';
import { TacticsTimelineView } from './TacticsTimelineView';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { PlaylistReviewView } from '../components/PlaylistReviewView';
import { StudioCoachView } from './StudioCoachView';
import { StudioCanvasView } from './StudioCanvasView';
import type { TacticsInspectorPanel } from './StudioSidebarView';
import { StudioSidebarView } from './StudioSidebarView';
import { StudioTransportView } from './StudioTransportView';
import { useStudioEditor } from './useStudioEditor';
import { playerGraphics, studioObjects } from '../fixtures/studio';
import type { DrawingObject } from '../../../types/playlist/core';

const StudioFixture = ({
  empty = false,
  inspectorStates = false,
  initialObjects = studioObjects,
}: {
  empty?: boolean;
  inspectorStates?: boolean;
  initialObjects?: DrawingObject[];
}): ReactElement => {
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 450 });
  const [history, setHistory] = useState<DrawingObject[][]>([
    empty ? [] : initialObjects,
  ]);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(12);
  const [panel, setPanel] = useState<TacticsInspectorPanel>('draw');
  const [coachMode, setCoachMode] = useState(false);
  const [freeze, setFreeze] = useState(3);
  useLayoutEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      setTime((value) => (value >= 30 ? 0 : value + (now - last) / 1000));
      last = now;
    }, 33);
    return () => clearInterval(timer);
  }, [playing]);
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
    onToolSelected: () => setPanel('draw'),
    onTogglePlayback: () => setPlaying((value) => !value),
    documentKey: 'fixture-primary',
    enabled: !empty && !playing,
    objects: history[cursor],
    time,
    maxTime: 30,
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
        onKeyDown={editor.inspector.onKeyDown}
        tools={
          !coachMode && (
            <StudioToolsView
              tool={editor.inspector.tool}
              onChange={editor.inspector.onToolChange}
              disabled={!editor.inspector.enabled}
            />
          )
        }
        inspector={
          coachMode ? null : (
            <StudioSidebarView
              {...(inspectorStates ? studioInspectorFixture : {})}
              panel={panel}
              onPanelChange={setPanel}
              {...{
                ...editor.inspector,
                target: 'primary',
                hasSecondary: false,
                onTargetChange: () => {},
              }}
            />
          )
        }
        transport={
          <>
            <StudioTransportView
              coachMode={coachMode}
              onCoachModeChange={setCoachMode}
              {...{
                time,
                min: 0,
                max: 30,
                freezeDuration: freeze,
                onFreezeDurationChange: setFreeze,
                playing,
                disabled: empty,
                onSeek: setTime,
                onTogglePlay: () => setPlaying(!playing),
              }}
            />
            {coachMode && (
              <StudioCoachView
                editor={editor.inspector}
                onClearFrame={() => {
                  setHistory([
                    ...history.slice(0, cursor + 1),
                    history[cursor].filter(
                      (object) => Math.abs(object.timestamp - time) > 0.12,
                    ),
                  ]);
                  setCursor(cursor + 1);
                }}
              />
            )}
            {!coachMode && (
              <TacticsTimelineView
                objects={history[cursor]}
                time={time}
                min={0}
                max={30}
                selectedId={editor.inspector.selectedId}
                onSelect={editor.inspector.onSelect}
                onSeek={setTime}
              />
            )}
          </>
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
                PAINT · FIXTURE
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
  title: 'Workspace/Playlist/Paint',
  component: PlaylistReviewView,
  render: () => <StudioFixture />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};
export const Empty: Story = { render: () => <StudioFixture empty /> };

export const VideoTracking: Story = { render: () => <TacticsVideoFixture /> };

export const PlayerGraphics: Story = {
  render: () => <StudioFixture initialObjects={playerGraphics} />,
};

export const InspectorLayout: Story = {
  render: () => <StudioFixture inspectorStates />,
};
export const CollapsedInspector: Story = {
  play: ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="Paintの編集パネルを折りたたむ"]',
      )
      ?.click();
  },
};
