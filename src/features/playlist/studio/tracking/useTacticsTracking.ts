import { useEffect, useRef, useState } from 'react';
import type { DrawingObject } from '../../../../types/playlist/core';
import { trackAnnotation } from './trackAnnotation';
import type { TrackingResult } from './trackAnnotation';
export interface TacticsTrackingProps {
  available: boolean;
  running: boolean;
  progress: number;
  message: string;
  hasResult: boolean;
  onStart: () => void;
  onCancel: () => void;
  onApply: () => void;
  onDiscard: () => void;
}
export const useTacticsTracking = ({
  documentKey,
  source,
  selected,
  endTime,
  time,
  enabled,
  onApply,
}: {
  documentKey: string;
  source: () => string | undefined;
  selected: DrawingObject | null;
  endTime: number;
  time: number;
  enabled: boolean;
  onApply: (object: DrawingObject) => void;
}): TacticsTrackingProps => {
  const key = `${documentKey}:${selected?.id}`;
  const [state, setState] = useState<{
    key: string;
    running: boolean;
    progress: number;
    message: string;
    snapshot: string;
    result?: TrackingResult;
  } | null>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      abort.current?.abort();
    },
    [key],
  );
  const current = state?.key === key ? state : null;
  const cancel = (): void => {
    abort.current?.abort();
    setState(null);
  };
  return {
    available:
      enabled &&
      Boolean(selected) &&
      (selected?.motion?.keyframes.length ?? 0) < 256 &&
      !current?.running &&
      (selected?.timestamp ?? endTime) <= time &&
      time < endTime,
    running: current?.running ?? false,
    progress: current?.progress ?? 0,
    message: current?.message ?? '',
    hasResult: Boolean(current?.result),
    onStart: () => {
      if (
        !selected ||
        !enabled ||
        current?.running ||
        (selected.motion?.keyframes.length ?? 0) >= 256
      )
        return;
      const url = source();
      if (!url) return;
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      const snapshot = JSON.stringify(selected);
      setState({
        key,
        running: true,
        progress: 0,
        message: '映像パターンを追跡中…',
        snapshot,
      });
      void trackAnnotation(
        url,
        selected,
        endTime,
        controller.signal,
        (progress) =>
          setState((previous) =>
            previous?.key === key ? { ...previous, progress } : previous,
          ),
        time,
      )
        .then((result) => {
          if (controller.signal.aborted) return;
          setState({
            key,
            snapshot,
            running: false,
            progress: 1,
            result,
            message: result.lost
              ? `${result.trackedDuration.toFixed(1)}秒で対象を見失いました。追跡できた範囲を適用できます。`
              : `${result.trackedDuration.toFixed(1)}秒を追跡しました。適用後に再生して確認してください。`,
          });
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted)
            setState({
              key,
              snapshot,
              running: false,
              progress: 0,
              message:
                error instanceof Error
                  ? error.message
                  : '追跡できませんでした。',
            });
        });
    },
    onCancel: cancel,
    onDiscard: cancel,
    onApply: () => {
      if (!current?.result || !enabled) return;
      if (JSON.stringify(selected) !== current.snapshot) {
        setState({
          ...current,
          result: undefined,
          message:
            '描画が変更されたため結果を破棄しました。再度追跡してください。',
        });
        return;
      }
      onApply(current.result.object);
      setState(null);
    },
  };
};
