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
  onManualSync: (callback: () => void) => void; // 追加
  offResyncAudio: (callback: () => void) => void; // 追加
  offResetSync: (callback: () => void) => void; // 追加
  offManualSync: (callback: () => void) => void; // 追加
  onSetSyncMode: (callback: (mode: 'auto' | 'manual') => void) => void; // 追加
  offSetSyncMode: (callback: (mode: 'auto' | 'manual') => void) => void; // 追加
  // ファイル存在確認
  checkFileExists: (filePath: string) => Promise<boolean>;
  saveSyncData: (
    configPath: string,
    syncData: {
      syncOffset: number;
      isAnalyzed: boolean;
      confidenceScore?: number;
    },
  ) => Promise<boolean>;
  setManualModeChecked: (checked: boolean) => Promise<boolean>;
  convertConfigToRelativePath: (packagePath: string) => Promise<{
    success: boolean;
    config?: any;
    error?: string;
  }>;
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
