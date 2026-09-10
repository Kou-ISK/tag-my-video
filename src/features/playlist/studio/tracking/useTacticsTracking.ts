import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const latest = useRef({ selected, enabled, onApply });
  useLayoutEffect(() => {
    latest.current = { selected, enabled, onApply };
  }, [selected, enabled, onApply]);
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
    message:
      current?.message ??
      (!selected
        ? '追尾する図形を選択してください。'
        : !enabled
          ? '映像を一時停止すると追尾できます。'
          : time >= endTime
            ? 'クリップ末尾です。開始位置へ戻してください。'
            : ''),
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
      if (!url) {
        setState({
          key,
          running: false,
          progress: 0,
          snapshot: '',
          message:
            '映像を読み込めません。クリップを開き直して再試行してください。',
        });
        return;
      }
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
          if (
            JSON.stringify(latest.current.selected) !== snapshot ||
            !latest.current.enabled
          ) {
            setState({
              key,
              snapshot,
              running: false,
              progress: 0,
              message: '選択や描画が変わったため追尾結果を破棄しました。',
            });
            return;
          }
          if (!result.lost) latest.current.onApply(result.object);
          setState({
            key,
            snapshot,
            running: false,
            progress: 1,
            result: result.lost ? result : undefined,
            message: result.lost
              ? `${result.trackedDuration.toFixed(1)}秒で対象を見失いました。追跡できた範囲を適用できます。`
              : `${result.trackedDuration.toFixed(1)}秒の追尾を反映しました。再生して確認できます（取り消し可能）。`,
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
