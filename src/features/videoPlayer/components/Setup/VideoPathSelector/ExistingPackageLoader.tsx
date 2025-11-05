import React from 'react';
import { Button } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { VideoSyncData } from '../../../../../types/VideoSync';
import { PackageLoadResult } from './types';

interface ExistingPackageLoaderProps {
  onPackageLoaded: (result: PackageLoadResult) => void;
  performAudioSync: (tightPath: string, widePath: string) => Promise<VideoSyncData>;
}

const ensureElectron = () => {
  if (!window.electronAPI) {
    alert('この機能はElectronアプリケーション内でのみ利用できます。');
    return false;
  }
  return true;
};

export const ExistingPackageLoader: React.FC<ExistingPackageLoaderProps> = ({
  onPackageLoaded,
  performAudioSync,
}) => {
  const handleSelectPackage = async () => {
    if (!ensureElectron()) {
      return;
    }

    const packagePath = await window.electronAPI?.openDirectory();
    if (!packagePath) {
      return;
    }

    const configFilePath = `${packagePath}/.metadata/config.json`;

    if (window.electronAPI?.convertConfigToRelativePath) {
      try {
        await window.electronAPI.convertConfigToRelativePath(packagePath);
      } catch (error) {
        console.warn('config.json変換をスキップ:', error);
      }
    }

    const exists = await window.electronAPI?.checkFileExists?.(configFilePath);
    if (!exists) {
      alert('選択したパッケージ内に .metadata/config.json が見つかりません。');
      return;
    }

    try {
      const response = await fetch(configFilePath);
      if (!response.ok) {
        throw new Error('Failed to load config.json');
      }
      const config = await response.json();

      const tightRelative = config.tightViewPath as string;
      const wideRelative = (config.wideViewPath || undefined) as string | undefined;
      const tightAbsolute = `${packagePath}/${tightRelative}`;
      const wideAbsolute = wideRelative ? `${packagePath}/${wideRelative}` : undefined;

      let resultingSyncData: VideoSyncData | undefined;
      const videoList = wideAbsolute ? [tightAbsolute, wideAbsolute] : [tightAbsolute];

      if (wideAbsolute) {
        const storedSync = config.syncData as
          | {
              syncOffset?: unknown;
              isAnalyzed?: unknown;
              confidenceScore?: unknown;
            }
          | undefined;

        if (storedSync && typeof storedSync.syncOffset === 'number') {
          resultingSyncData = {
            syncOffset: storedSync.syncOffset,
            isAnalyzed: !!storedSync.isAnalyzed,
            confidenceScore:
              typeof storedSync.confidenceScore === 'number'
                ? storedSync.confidenceScore
                : undefined,
          } as VideoSyncData;
        } else {
          resultingSyncData = await performAudioSync(tightAbsolute, wideAbsolute);
          if (resultingSyncData && window.electronAPI?.saveSyncData) {
            try {
              await window.electronAPI.saveSyncData(configFilePath, resultingSyncData);
            } catch (error) {
              console.error('同期データの保存に失敗:', error);
            }
          }
        }
      } else {
        resultingSyncData = undefined;
      }

      onPackageLoaded({
        videoList,
        syncData: resultingSyncData,
        timelinePath: `${packagePath}/timeline.json`,
        metaDataConfigFilePath: configFilePath,
        packagePath,
      });
    } catch (error) {
      console.error('Config.json の読み込みに失敗しました:', error);
      alert('パッケージの読み込み中にエラーが発生しました。');
    }
  };

  return (
    <Button
      sx={{ height: '120px', fontSize: '18px' }}
      onClick={handleSelectPackage}
      variant="contained"
      size="large"
      startIcon={<FolderOpenIcon />}
    >
      既存パッケージを開く
    </Button>
  );
};
