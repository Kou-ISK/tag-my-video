import {
  IpcRenderer,
  IpcRendererEvent,
  contextBridge,
  ipcRenderer,
} from 'electron';
import { PackageDatas } from '../../src/renderer';

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
});

// 元リスナー -> ラップしたリスナーの対応表（チャンネル毎）
const __listenerStore: Map<
  string,
  Map<Function, (...args: unknown[]) => void>
> = new Map();

// 任意: 警告閾値を引き上げ（根本対処は off の修正）
try {
  (
    ipcRenderer as unknown as { setMaxListeners?: (n: number) => void }
  ).setMaxListeners?.(50);
} catch {
  // noop
}

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: async () => {
    try {
      const filePath = await ipcRenderer.invoke('open-file');
      return filePath;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  },
  openDirectory: async () => {
    try {
      const filePath = await ipcRenderer.invoke('open-directory');
      return filePath;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  },
  exportTimeline: async (filePath: string, source: any) => {
    try {
      await ipcRenderer.invoke('export-timeline', filePath, source);
      console.log('Timeline exported successfully.');
    } catch (error) {
      console.error('Error exporting timeline:', error);
    }
  },
  createPackage: async (
    directoryName: string,
    packageName: string,
    tightViewPath: string,
    wideViewPath: string | null,
    metaData: any,
  ) => {
    try {
      const packageDatas: PackageDatas = await ipcRenderer.invoke(
        'create-package',
        directoryName,
        packageName,
        tightViewPath,
        wideViewPath,
        metaData,
      );
      return packageDatas;
    } catch (error) {
      console.error('Error creating package:', error);
    }
  },
  saveSyncData: async (
    configPath: string,
    syncData: {
      syncOffset: number;
      isAnalyzed: boolean;
      confidenceScore?: number;
    },
  ) => {
    try {
      return await ipcRenderer.invoke('save-sync-data', configPath, syncData);
    } catch (e) {
      console.error('saveSyncData error:', e);
      return false;
    }
  },
  on: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) => {
    const wrapped = (event: IpcRendererEvent, ...args: unknown[]) =>
      listener(event, ...args);

    let map = __listenerStore.get(channel);
    if (!map) {
      map = new Map();
      __listenerStore.set(channel, map);
    }
    map.set(listener, wrapped);
    ipcRenderer.on(channel, wrapped as any);
  },
  off: (channel: string, listener: (...args: unknown[]) => void) => {
    try {
      const map = __listenerStore.get(channel);
      const wrapped = map?.get(listener as unknown as Function);
      if (wrapped) {
        ipcRenderer.removeListener(channel, wrapped as any);
        map?.delete(listener as unknown as Function);
        if (map && map.size === 0) __listenerStore.delete(channel);
      } else {
        // フォールバック（互換性）
        ipcRenderer.removeListener(channel, listener as any);
      }
    } catch (e) {
      console.warn('ipcRenderer.removeListener error', e);
    }
  },
  // メニューからの音声同期イベント
  onResyncAudio: (callback: () => void) => {
    try {
      ipcRenderer.removeAllListeners('menu-resync-audio');
    } catch {}
    ipcRenderer.on('menu-resync-audio', callback);
  },
  onResetSync: (callback: () => void) => {
    try {
      ipcRenderer.removeAllListeners('menu-reset-sync');
    } catch {}
    ipcRenderer.on('menu-reset-sync', callback);
  },
  onAdjustSyncOffset: (callback: () => void) => {
    try {
      ipcRenderer.removeAllListeners('menu-adjust-sync-offset');
    } catch {}
    ipcRenderer.on('menu-adjust-sync-offset', callback);
  },
  // 追加: まとめてクリアするAPI（必要なら使用）
  clearMenuSyncListeners: () => {
    try {
      ipcRenderer.removeAllListeners('menu-resync-audio');
      ipcRenderer.removeAllListeners('menu-reset-sync');
      ipcRenderer.removeAllListeners('menu-adjust-sync-offset');
    } catch {}
  },
  // ファイル存在確認
  checkFileExists: async (filePath: string) => {
    try {
      const exists = await ipcRenderer.invoke('check-file-exists', filePath);
      return exists;
    } catch (error) {
      console.error('Error checking file:', error);
      return false;
    }
  },
});
