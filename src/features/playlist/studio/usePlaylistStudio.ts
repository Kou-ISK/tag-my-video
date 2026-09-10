import { useMemo, useRef, useState } from 'react';
import type { AnnotationTarget } from '../../../types/playlist/core';
import type { PlaylistWorkspaceMode } from '../../../types/playlist/window';
import type { PlaylistWindowRuntime } from '../hooks/playlist/usePlaylistWindowRuntime';
import { useStudioEditor } from './useStudioEditor';
import type { StudioEditor } from './useStudioEditor';
import type { StudioSidebarViewProps } from './StudioSidebarView';
import type { StudioTransportViewProps } from './StudioTransportView';
import type { StudioCoachViewProps } from './StudioCoachView';
import type { StudioClipsViewProps } from './StudioClipsView';

interface PlaylistStudio {
  active: boolean;
  coachMode: boolean;
  coach: StudioCoachViewProps;
  canvas: StudioEditor['canvas'];
  sidebar: StudioSidebarViewProps;
  transport: StudioTransportViewProps;
  clips: StudioClipsViewProps;
  onModeChange: (mode: PlaylistWorkspaceMode) => void;
}
export const usePlaylistStudio = (
  runtime: PlaylistWindowRuntime,
): PlaylistStudio => {
  const { core, annotations, currentItemState, history, playback } = runtime;
  const [coachMode, setCoachMode] = useState(false);
  const previousView = useRef(core.viewMode);
  const active = core.workspaceMode === 'studio';
  const target = core.drawingTarget;
  const secondary = target === 'secondary';
  const item = currentItemState.currentItem;
  const objects = useMemo(
    () =>
      annotations.currentAnnotation?.objects.filter(
        (object) => (object.target || 'primary') === target,
      ) ?? [],
    [annotations.currentAnnotation, target],
  );
  const seek = (time: number): void => {
    core.setIsPlaying(false);
    playback.handleSeek(new Event('studio-seek'), time);
  };
  const selectClip = (id: string): void => {
    playback.handlePlayItem(id);
    core.setIsPlaying(false);
  };
  const editor = useStudioEditor({
    documentKey: `${core.loadedFilePath}:${item?.id}:${target}`,
    enabled:
      active &&
      Boolean(item && currentItemState.currentVideoSource) &&
      !core.isPlaying &&
      !core.isFrozen,
    objects,
    time: core.currentTime,
    target,
    ...(secondary ? core.secondaryCanvasSize : core.primaryCanvasSize),
    contentRect: secondary
      ? core.secondaryContentRect
      : core.primaryContentRect,
    onCommit: (next) => annotations.handleAnnotationObjectsChange(next, target),
    onSeek: seek,
    onUndo: runtime.handleUndo,
    onRedo: runtime.handleRedo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  });
  const onTargetChange = (value: AnnotationTarget): void => {
    if (value === 'secondary' && !currentItemState.currentVideoSource2) return;
    seek(core.currentTime);
    core.setDrawingTarget(value);
    core.setViewMode(value === 'primary' ? 'angle1' : 'angle2');
  };
  return {
    active,
    coachMode,
    coach: {
      editor: editor.inspector,
      onClearFrame: () => {
        if (!editor.inspector.enabled) return;
        annotations.handleAnnotationObjectsChange(
          objects.filter(
            (object) => Math.abs(object.timestamp - core.currentTime) > 0.12,
          ),
          target,
        );
      },
    },
    canvas: editor.canvas,
    sidebar: {
      ...editor.inspector,
      target,
      hasSecondary: Boolean(currentItemState.currentVideoSource2),
      onTargetChange,
    },
    transport: {
      coachMode,
      onCoachModeChange: setCoachMode,
      time: core.currentTime,
      min: currentItemState.sliderMin,
      max: currentItemState.sliderMax,
      playing: core.isPlaying || core.isFrozen,
      disabled: !item || !currentItemState.currentVideoSource,
      freezeDuration: annotations.currentAnnotation?.freezeDuration ?? 3,
      onFreezeDurationChange: annotations.handleFreezeDurationChange,
      onSeek: seek,
      onTogglePlay: () => {
        if (core.isPlaying || core.isFrozen) seek(core.currentTime);
        else playback.handleTogglePlay();
      },
    },
    clips: {
      items: history.items,
      currentIndex: core.currentIndex,
      onSelect: selectClip,
    },
    onModeChange: (mode): void => {
      if (mode === core.workspaceMode) return;
      if (core.isDrawingMode) runtime.handleToggleDrawingMode();
      if (mode === 'studio') {
        previousView.current = core.viewMode;
        seek(core.currentTime);
        core.setViewMode('angle1');
        core.setDrawingTarget('primary');
        if (!item && history.items[0]) selectClip(history.items[0].id);
      } else if (active) {
        seek(core.currentTime);
        core.setViewMode(previousView.current);
      }
      core.setWorkspaceMode(mode);
    },
  };
};
