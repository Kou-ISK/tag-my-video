import { useEffect, useCallback } from 'react';
import type { StatsView } from '../../../features/videoPlayer/components/Analytics/StatsModal/StatsModal';

interface UseStatsMenuHandlersParams {
  setStatsView: React.Dispatch<React.SetStateAction<StatsView>>;
  setStatsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useStatsMenuHandlers = ({
  setStatsView,
  setStatsOpen,
}: UseStatsMenuHandlersParams) => {
  // useCallbackで安定した関数参照を作成
  const handleShortcut = useCallback(
    (_event: unknown, args: unknown) => {
      if (args === 'analyze') {
        setStatsView('possession');
        setStatsOpen((prev) => !prev);
      }
    },
    [setStatsView, setStatsOpen],
  );

  const handleMenuStats = useCallback(
    (_event: unknown, requested?: unknown) => {
      const statsViewOptions: StatsView[] = [
        'possession',
        'results',
        'types',
        'momentum',
      ];
      const nextView = statsViewOptions.includes(requested as StatsView)
        ? (requested as StatsView)
        : 'possession';
      setStatsView(nextView);
      setStatsOpen(true);
    },
    [setStatsView, setStatsOpen],
  );

  useEffect(() => {
    if (!globalThis.window.electronAPI?.on) {
      return;
    }

    const api = globalThis.window.electronAPI;

    api.on('general-shortcut-event', handleShortcut);
    api.on('menu-show-stats', handleMenuStats);
    console.log(
      '[STATS] general-shortcut-event, menu-show-stats リスナー登録完了',
    );

    return () => {
      try {
        api.off?.('general-shortcut-event', handleShortcut);
        api.off?.('menu-show-stats', handleMenuStats);
        console.log('[STATS] リスナー解除完了');
      } catch (error) {
        console.debug('stats event cleanup error', error);
      }
    };
  }, [handleShortcut, handleMenuStats]); // useCallbackで安定した参照を依存配列に指定
};
