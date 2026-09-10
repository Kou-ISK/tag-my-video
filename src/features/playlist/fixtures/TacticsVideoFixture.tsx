import { StudioToolsView } from '../studio/StudioToolsView';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { Box } from '@mui/material';
import source from './tactics-motion.webm?url';
import type { ItemAnnotation } from '../../../types/playlist/core';
import { PlaylistReviewView } from '../components/PlaylistReviewView';
import { useStudioEditor } from '../studio/useStudioEditor';
import { useTacticsTracking } from '../studio/tracking/useTacticsTracking';
import { usePitchCalibration } from '../studio/usePitchCalibration';
import { useTacticsChroma } from '../studio/useTacticsChroma';
import { useTacticsPresets } from '../studio/useTacticsPresets';
import { useAnnotationFrameClock } from '../hooks/playlist/useAnnotationFrameClock';
import { StudioSidebarView } from '../studio/StudioSidebarView';
import type { TacticsInspectorPanel } from '../studio/StudioSidebarView';
import { StudioCanvasView } from '../studio/StudioCanvasView';
import { PitchCalibrationOverlayView } from '../studio/PitchCalibrationOverlayView';
import { TacticsTimelineView } from '../studio/TacticsTimelineView';
import { StudioTransportView } from '../studio/StudioTransportView';

const initial: ItemAnnotation = {
  freezeDuration: 2,
  freezeAt: 0,
  objects: [
    {
      id: 'target',
      type: 'rectangle',
      color: '#FFD60A',
      strokeWidth: 2,
      startX: 40,
      startY: 60,
      endX: 64,
      endY: 84,
      timestamp: 0,
      baseWidth: 320,
      baseHeight: 180,
    },
  ],
};
/** 合成映像を使い、実デコーダー・追跡器・履歴・描画を結合して試す。 */
export const TacticsVideoFixture = (): ReactElement => {
  const video = useRef<HTMLVideoElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 450 });
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [panel, setPanel] = useState<TacticsInspectorPanel>('motion');
  const [history, setHistory] = useState([initial]);
  const [cursor, setCursor] = useState(0);
  const annotation = history[cursor];
  const commit = (next: ItemAnnotation): void => {
    setHistory([...history.slice(0, cursor + 1), next]);
    setCursor(cursor + 1);
  };
  const seek = (next: number): void => {
    if (playing) setPlaying(false);
    setTime(next);
    if (video.current) video.current.currentTime = next;
  };
  useEffect(() => {
    if (playing) void video.current?.play().catch(() => setPlaying(false));
    else video.current?.pause();
  }, [playing]);
  useLayoutEffect(() => {
    if (!area.current) return;
    const observer = new ResizeObserver(() => {
      if (area.current)
        setSize({
          width: area.current.clientWidth,
          height: area.current.clientHeight,
        });
    });
    observer.observe(area.current);
    return () => observer.disconnect();
  }, []);
  useAnnotationFrameClock(video, playing, setTime);
  const width = Math.min(size.width, (size.height * 16) / 9);
  const height = (width * 9) / 16;
  const contentRect = {
    width,
    height,
    offsetX: (size.width - width) / 2,
    offsetY: (size.height - height) / 2,
  };
  const editor = useStudioEditor({
    onToolSelected: () => setPanel('draw'),
    onTogglePlayback: () => setPlaying((value) => !value),
    documentKey: 'video-fixture',
    enabled: !playing,
    ...size,
    contentRect,
    time,
    maxTime: 3.9,
    target: 'primary',
    objects: annotation.objects,
    videoRef: video,
    chromaKey: annotation.chromaKey?.primary,
    onCommit: (objects) => commit({ ...annotation, objects }),
    onSeek: seek,
    canUndo: cursor > 0,
    canRedo: cursor < history.length - 1,
    onUndo: () => setCursor(Math.max(0, cursor - 1)),
    onRedo: () => setCursor(Math.min(history.length - 1, cursor + 1)),
  });
  const tracking = useTacticsTracking({
    documentKey: 'video-fixture',
    source: () => video.current?.currentSrc,
    selected: editor.inspector.selected,
    time,
    endTime: 3.9,
    enabled: !playing,
    onApply: editor.inspector.onUpdate,
  });
  const pitch = usePitchCalibration({
    documentKey: 'video-fixture',
    enabled: !playing,
    calibration: annotation.pitchCalibration?.primary,
    selected: editor.inspector.selected,
    contentRect,
    time,
    onSave: (value) =>
      commit({ ...annotation, pitchCalibration: { primary: value } }),
    onAdd: (object) =>
      commit({ ...annotation, objects: [...annotation.objects, object] }),
  });
  const chroma = useTacticsChroma(
    annotation.chromaKey?.primary,
    playing,
    () => video.current,
    (value) => commit({ ...annotation, chromaKey: { primary: value } }),
  );
  const presets = useTacticsPresets(
    editor.inspector.selected,
    !playing,
    time,
    (object) =>
      commit({ ...annotation, objects: [...annotation.objects, object] }),
  );
  return (
    <Box sx={{ height: '100vh', minHeight: 540 }}>
      <PlaylistReviewView
        onKeyDown={editor.inspector.onKeyDown}
        tools={
          true && (
            <StudioToolsView
              tool={editor.inspector.tool}
              onChange={editor.inspector.onToolChange}
              disabled={!editor.inspector.enabled}
            />
          )
        }
        media={
          <Box ref={area} sx={{ position: 'absolute', inset: 0 }}>
            <video
              ref={video}
              src={source}
              muted
              playsInline
              onTimeUpdate={() => setTime(video.current?.currentTime ?? 0)}
              onEnded={() => setPlaying(false)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <StudioCanvasView
              {...editor.canvas}
              enabled={!playing && !pitch.editing}
            />
            <PitchCalibrationOverlayView
              pitch={pitch}
              {...size}
              contentRect={contentRect}
            />
          </Box>
        }
        inspector={
          <StudioSidebarView
            {...editor.inspector}
            panel={panel}
            onPanelChange={setPanel}
            target="primary"
            hasSecondary={false}
            onTargetChange={() => {}}
            tracking={tracking}
            pitch={pitch}
            chroma={chroma}
            presets={presets}
          />
        }
        transport={
          <>
            <StudioTransportView
              time={time}
              min={0}
              max={3.9}
              playing={playing}
              disabled={false}
              freezeDuration={annotation.freezeDuration}
              onSeek={seek}
              onTogglePlay={() => setPlaying(!playing)}
              onFreezeDurationChange={(value) =>
                commit({ ...annotation, freezeDuration: value })
              }
            />
            <TacticsTimelineView
              objects={annotation.objects}
              time={time}
              min={0}
              max={3.9}
              selectedId={editor.inspector.selectedId}
              onSelect={editor.inspector.onSelect}
              onSeek={seek}
            />
          </>
        }
      />
    </Box>
  );
};
