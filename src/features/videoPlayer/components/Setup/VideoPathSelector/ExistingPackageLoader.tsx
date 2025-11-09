import React from 'react';
import { Button } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { VideoSyncData } from '../../../../../types/VideoSync';
import { PackageLoadResult } from './types';
import { useNotification } from '../../../../../contexts/NotificationContext';

interface ExistingPackageLoaderProps {
  onPackageLoaded: (result: PackageLoadResult) => void;
  performAudioSync: (
    tightPath: string,
    widePath: string,
  ) => Promise<VideoSyncData>;
}

export const ExistingPackageLoader: React.FC<ExistingPackageLoaderProps> = ({
  onPackageLoaded,
  performAudioSync,
}) => {
  const { error: showError } = useNotification();

  const handleSelectPackage = async () => {
    if (!globalThis.window.electronAPI) {
      showError('この機能はElectronアプリケーション内でのみ利用できます。');
      return;
    }

    const packagePath = await globalThis.window.electronAPI?.openDirectory();
    if (!packagePath) {
      return;
    }

    const configFilePath = `${packagePath}/.metadata/config.json`;

    if (globalThis.window.electronAPI?.convertConfigToRelativePath) {
      try {
        await globalThis.window.electronAPI.convertConfigToRelativePath(
          packagePath,
        );
      } catch (error) {
        console.warn('config.json変換をスキップ:', error);
      }
    }

    const exists =
      await globalThis.window.electronAPI?.checkFileExists?.(configFilePath);
    if (!exists) {
      showError(
        '選択したパッケージ内に .metadata/config.json が見つかりません。',
      );
      return;
    }

    try {
      const response = await fetch(configFilePath);
      if (!response.ok) {
        throw new Error('Failed to load config.json');
      }
      const config = await response.json();

      const tightRelative = config.tightViewPath as string;
      const wideRelative = (config.wideViewPath || undefined) as
        | string
        | undefined;
      const tightAbsolute = `${packagePath}/${tightRelative}`;
      const wideAbsolute = wideRelative
        ? `${packagePath}/${wideRelative}`
        : undefined;

      let resultingSyncData: VideoSyncData | undefined;
      const videoList = wideAbsolute
        ? [tightAbsolute, wideAbsolute]
        : [tightAbsolute];

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
          resultingSyncData = await performAudioSync(
            tightAbsolute,
            wideAbsolute,
          );
          if (
            resultingSyncData &&
            globalThis.window.electronAPI?.saveSyncData
          ) {
            try {
              await globalThis.window.electronAPI.saveSyncData(
                configFilePath,
                resultingSyncData,
              );
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
      showError('パッケージの読み込み中にエラーが発生しました。');
    }
  };

  return (
    <Button
      sx={{ height: '60px', fontSize: '16px', flex: 1 }}
      onClick={handleSelectPackage}
      variant="contained"
      size="large"
      startIcon={<FolderOpenIcon />}
    >
      既存パッケージを開く
    </Button>
  );
};
