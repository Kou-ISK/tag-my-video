export interface IElectronAPI {
  openFile: () => Promise<string>;
  openDirectory: () => Promise<string>;
  exportTimeline: (filePath: string, source: any) => Promise<void>;
  createPackage: (
    directoryName: string,
    packageName: string,
    tightViewPath: string,
    wideViewPath: string | null,
    metaDataConfig: any,
  ) => Promise<PackageDatas>;
  on: (channel: string, listener: (event: any, args: any) => void) => void;
  // メニューからの音声同期イベント
  onResyncAudio: (callback: () => void) => void;
  onResetSync: (callback: () => void) => void;
  onAdjustSyncOffset: (callback: () => void) => void;
}

export interface PackageDatas {
  timelinePath: string;
  tightViewPath: string;
  wideViewPath: string | null;
  metaDataConfigFilePath: string;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
