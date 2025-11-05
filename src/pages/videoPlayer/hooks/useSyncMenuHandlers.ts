import { useEffect } from 'react';

interface UseSyncMenuHandlersParams {
  onResyncAudio: () => void;
  onResetSync: () => void;
  onManualSync: () => void;
  onSetSyncMode: (mode: 'auto' | 'manual') => void;
}

export const useSyncMenuHandlers = ({
  onResyncAudio,
  onResetSync,
  onManualSync,
  onSetSyncMode,
}: UseSyncMenuHandlersParams) => {
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const onResync = () => onResyncAudio();
    const onReset = () => onResetSync();
    const onManual = () => onManualSync();
    const onSetMode = (mode: 'auto' | 'manual') => onSetSyncMode(mode);

    window.electronAPI.onResyncAudio(onResync);
    window.electronAPI.onResetSync(onReset);
    window.electronAPI.onManualSync(onManual);
    window.electronAPI.onSetSyncMode(onSetMode);

    return () => {
      try {
        window.electronAPI?.offResyncAudio?.(onResync);
        window.electronAPI?.offResetSync?.(onReset);
        window.electronAPI?.offManualSync?.(onManual);
        window.electronAPI?.offSetSyncMode?.(onSetMode);
      } catch (error) {
        console.debug('メニューイベントの解除エラー', error);
      }
    };
  }, [onResyncAudio, onResetSync, onManualSync, onSetSyncMode]);
};
