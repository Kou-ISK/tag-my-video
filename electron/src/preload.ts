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
  on: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => IpcRenderer,
  ) => {
    ipcRenderer.on(channel, (_event, ...args) => listener(_event, ...args));
  },
  // メニューからの音声同期イベント
  onResyncAudio: (callback: () => void) => {
    ipcRenderer.on('menu-resync-audio', callback);
  },
  onResetSync: (callback: () => void) => {
    ipcRenderer.on('menu-reset-sync', callback);
  },
  onAdjustSyncOffset: (callback: () => void) => {
    ipcRenderer.on('menu-adjust-sync-offset', callback);
  },
});
