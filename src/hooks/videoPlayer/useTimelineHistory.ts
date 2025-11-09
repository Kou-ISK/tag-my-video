import { useCallback, useEffect, useRef, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';

interface TimelineHistoryState {
  past: TimelineData[][];
  present: TimelineData[];
  future: TimelineData[][];
}

interface UseTimelineHistoryReturn {
  timeline: TimelineData[];
  canUndo: boolean;
  canRedo: boolean;
  setTimeline: (timeline: TimelineData[]) => void;
  undo: () => TimelineData[] | null;
  redo: () => TimelineData[] | null;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

export function useTimelineHistory(
  initialTimeline: TimelineData[] = [],
): UseTimelineHistoryReturn {
  const [state, setState] = useState<TimelineHistoryState>({
    past: [],
    present: initialTimeline,
    future: [],
  });

  // スナップショットのスキップフラグ（外部からのsetで履歴を残さない場合用）
  const skipSnapshot = useRef(false);
  // 前回のinitialTimelineを保持（無限ループを防ぐため）
  const prevInitialTimelineJSON = useRef<string>(
    JSON.stringify(initialTimeline),
  );

  // 外部からのタイムライン更新を検知（ファイル読み込み時など）
  useEffect(() => {
    // initialTimelineが変更された場合、履歴をクリアして新しいタイムラインを設定
    const newJSON = JSON.stringify(initialTimeline);

    if (prevInitialTimelineJSON.current !== newJSON) {
      setState({
        past: [],
        present: initialTimeline,
        future: [],
      });
      prevInitialTimelineJSON.current = newJSON;
    }
  }, [initialTimeline]);

  const setTimeline = useCallback((newTimeline: TimelineData[]) => {
    if (skipSnapshot.current) {
      // スキップフラグがある場合は履歴に記録しない
      skipSnapshot.current = false;
      setState((prev) => ({
        ...prev,
        present: newTimeline,
      }));
      return;
    }

    setState((prev) => {
      const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY_SIZE);
      return {
        past: newPast,
        present: newTimeline,
        future: [], // 新しい変更を加えたらfutureはクリア
      };
    });
  }, []);

  const undo = useCallback((): TimelineData[] | null => {
    if (state.past.length === 0) {
      return null;
    }

    const previous = state.past.at(-1);
    if (!previous) return null;

    const newPast = state.past.slice(0, -1);

    setState({
      past: newPast,
      present: previous,
      future: [state.present, ...state.future],
    });

    return previous;
  }, [state]);

  const redo = useCallback((): TimelineData[] | null => {
    if (state.future.length === 0) {
      return null;
    }

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    setState({
      past: [...state.past, state.present],
      present: next,
      future: newFuture,
    });

    return next;
  }, [state]);

  const clearHistory = useCallback(() => {
    setState((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  return {
    timeline: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    setTimeline,
    undo,
    redo,
    clearHistory,
  };
}
