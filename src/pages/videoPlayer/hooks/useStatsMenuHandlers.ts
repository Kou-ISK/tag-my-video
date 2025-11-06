import { useEffect } from 'react';
import type { StatsView } from '../../../features/videoPlayer/components/Analytics/StatsModal/StatsModal';

interface UseStatsMenuHandlersParams {
  setStatsView: React.Dispatch<React.SetStateAction<StatsView>>;
  setStatsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useStatsMenuHandlers = ({
  setStatsView,
  setStatsOpen,
}: UseStatsMenuHandlersParams) => {
  useEffect(() => {
    if (!window.electronAPI?.on) {
      return;
    }

    const statsViewOptions: StatsView[] = [
      'possession',
      'results',
      'types',
      'momentum',
    ];

    const shortcutHandler = (_event: unknown, args: unknown) => {
      if (args === 'analyze') {
        setStatsView('possession');
        setStatsOpen((prev) => !prev);
      }
    };

    const menuStatsHandler = (_event: unknown, requested?: unknown) => {
      const nextView = statsViewOptions.includes(requested as StatsView)
        ? (requested as StatsView)
        : 'possession';
      setStatsView(nextView);
      setStatsOpen(true);
    };

    window.electronAPI.on('general-shortcut-event', shortcutHandler);
    window.electronAPI.on('menu-show-stats', menuStatsHandler);

    return () => {
      try {
        window.electronAPI?.off?.('general-shortcut-event', shortcutHandler);
        window.electronAPI?.off?.('menu-show-stats', menuStatsHandler);
      } catch (error) {
        console.debug('stats event cleanup error', error);
      }
    };
  }, [setStatsOpen, setStatsView]);
};
