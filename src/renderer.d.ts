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
  off: (channel: string, listener: (...args: unknown[]) => void) => void; // 追加
  // メニューからの音声同期イベント
  onResyncAudio: (callback: () => void) => void;
  onResetSync: (callback: () => void) => void;
  onAdjustSyncOffset: (callback: () => void) => void;
  offResyncAudio: (callback: () => void) => void; // 追加
  offResetSync: (callback: () => void) => void; // 追加
  offAdjustSyncOffset: (callback: () => void) => void; // 追加
  // ファイル存在確認
  checkFileExists: (filePath: string) => Promise<boolean>;
}

export interface PackageDatas {
  timelinePath: string;
  tightViewPath: string;
  wideViewPath: string | null;
  metaDataConfigFilePath: string;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}
