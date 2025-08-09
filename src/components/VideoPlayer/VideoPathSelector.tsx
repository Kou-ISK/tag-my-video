import {
  Box,
  Button,
  Input,
  CircularProgress,
  Typography,
} from '@mui/material';
import { PackageDatas } from '../../renderer';
import { MetaData } from '../../types/MetaData';
import { AudioSyncAnalyzer } from '../../utils/AudioSyncAnalyzer';
import { VideoSyncData } from '../../types/VideoSync';
import React, { Dispatch, SetStateAction, useState } from 'react';

interface VideoPathSelectorProps {
  setVideoList: Dispatch<SetStateAction<string[]>>;
  setIsFileSelected: Dispatch<SetStateAction<boolean>>;
  isFileSelected: boolean;
  setTimelineFilePath: Dispatch<SetStateAction<string>>;
  setPackagePath: Dispatch<SetStateAction<string>>;
  setMetaDataConfigFilePath: Dispatch<SetStateAction<string>>;
  setSyncData: Dispatch<SetStateAction<VideoSyncData | undefined>>;
}

export const VideoPathSelector = ({
  setVideoList,
  setIsFileSelected,
  isFileSelected,
  setTimelineFilePath,
  setPackagePath,
  setMetaDataConfigFilePath,
  setSyncData,
}: VideoPathSelectorProps) => {
  const [hasOpenModal, setHasOpenModal] = useState<boolean>(false);
  const [packageName, setPackageName] = useState<string>('');
  const [team1Name, setTeam1Name] = useState<string>('');
  const [team2Name, setTeam2Name] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleHasOpenModal = () => {
    setHasOpenModal(true);
  };

  // パッケージを選択した場合
  const setVideoPathByPackagePath = async () => {
    if (!window.electronAPI) {
      alert('この機能はElectronアプリケーション内でのみ利用できます。');
      return;
    }

    const packagePath = await window.electronAPI.openDirectory();
    if (packagePath) {
      console.log(packagePath + '/.metadata/config.json');
      setMetaDataConfigFilePath(packagePath + '/.metadata/config.json');
      fetch(packagePath + '/.metadata/config.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(async (data) => {
          console.log('Config.json loaded:', data);

          if (data.wideViewPath) {
            // ファイルパスをそのまま使用（Video.jsで適切に処理される）
            const newVideoList = [data.tightViewPath, data.wideViewPath];
            console.log('Setting video list with 2 videos:', {
              list: newVideoList,
              validPaths: newVideoList.map((path) => ({
                path,
                exists: !!path,
                length: path?.length,
                isAbsolute: path?.startsWith('/'),
              })),
            });
            setVideoList(newVideoList);
            // 2つの映像がある場合は音声同期分析を実行
            await performAudioSync(data.tightViewPath, data.wideViewPath);
          } else {
            const newVideoList = [data.tightViewPath];
            console.log('Setting video list with 1 video:', {
              list: newVideoList,
              validPaths: newVideoList.map((path) => ({
                path,
                exists: !!path,
                length: path?.length,
                isAbsolute: path?.startsWith('/'),
              })),
            });
            setVideoList(newVideoList);
            // 1つの映像の場合は同期データをリセット
            setSyncData(undefined);
          }
          setIsFileSelected(!isFileSelected);
        })
        .catch((error) => {
          console.error('Error loading JSON:', error);
        });
      setTimelineFilePath(packagePath + '/timeline.json');
      setPackagePath(packagePath);
      console.log('Selected file:', packagePath);
    } else {
      console.log('No file selected.');
    }
  };

  // 音声同期分析を実行する関数
  const performAudioSync = async (tightPath: string, widePath: string) => {
    setIsAnalyzing(true);
    try {
      const audioAnalyzer = new AudioSyncAnalyzer();
      const syncResult = await audioAnalyzer.quickSyncAnalysis(
        tightPath,
        widePath,
      );

      const syncData: VideoSyncData = {
        syncOffset: syncResult.offsetSeconds,
        isAnalyzed: true,
        confidenceScore: syncResult.confidence,
      };

      setSyncData(syncData);
      console.log('音声同期完了:', syncResult);
    } catch (error) {
      console.error('音声同期分析エラー:', error);
      // エラーの場合は同期なしでセット
      setSyncData({
        syncOffset: 0,
        isAnalyzed: false,
        confidenceScore: 0,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ファイル選択後にチーム名を選択し、.metadata/config.jsonに書き込む
  const createPackage = async (packageName: string) => {
    if (!window.electronAPI) {
      alert('この機能はElectronアプリケーション内でのみ利用できます。');
      return;
    }

    const directoryName = await window.electronAPI.openDirectory();
    const tightViewPath: string = await window.electronAPI.openFile();
    let wideViewPath = null; // 初期値をnullに設定

    // ワイドビューパスを選択するダイアログを表示
    const shouldSelectWideView =
      window.confirm('ワイドビューパスを選択しますか？');
    if (shouldSelectWideView) {
      wideViewPath = await window.electronAPI.openFile();
    }
    const metaDataConfig: MetaData = {
      tightViewPath: tightViewPath,
      wideViewPath: wideViewPath,
      team1Name: team1Name,
      team2Name: team2Name,
      actionList: [
        'ポゼッション',
        'スクラム',
        'ラインアウト',
        'キック',
        'タックル',
        'PK',
        'FK',
        'Check',
        'キックオフ',
        'トライ',
        'ショット',
      ],
    };
    const packageDatas: PackageDatas = await window.electronAPI.createPackage(
      directoryName,
      packageName,
      tightViewPath,
      wideViewPath,
      metaDataConfig,
    );
    if (packageDatas.wideViewPath) {
      setVideoList([packageDatas.tightViewPath, packageDatas.wideViewPath]);
      // 2つの映像がある場合は音声同期分析を実行
      await performAudioSync(
        packageDatas.tightViewPath,
        packageDatas.wideViewPath,
      );
    } else {
      setVideoList([packageDatas.tightViewPath]);
      // 1つの映像の場合は同期データをリセット
      setSyncData(undefined);
    }
    setTimelineFilePath(packageDatas.timelinePath);
    setHasOpenModal(!hasOpenModal);
    setIsFileSelected(!isFileSelected);
    setMetaDataConfigFilePath(packageDatas.metaDataConfigFilePath);
  };

  return (
    <div style={{ marginLeft: '20vw', marginRight: '20vw' }}>
      <Box display={'flex'} flexDirection={'column'}>
        <Button
          sx={{ height: '200px', fontsize: '200px', margin: '20px' }}
          onClick={setVideoPathByPackagePath}
          variant="contained"
        >
          ビデオパッケージを選択
        </Button>
        <Button
          sx={{ height: '200px', fontsize: '200px', margin: '20px' }}
          onClick={handleHasOpenModal}
          variant="outlined"
        >
          新規パッケージ
        </Button>
      </Box>
      {hasOpenModal && (
        <Box>
          <div>
            <label htmlFor="packageName">パッケージ名</label>
            <Input
              id="packageName"
              value={packageName}
              onChange={(e) => setPackageName(e.currentTarget.value)}
            />
          </div>
          <div>
            <label htmlFor="team1Name">チーム名(1)</label>
            <Input
              id="team1Name"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.currentTarget.value)}
            ></Input>
          </div>
          <div>
            <label htmlFor="team2Name">チーム名(2)</label>
            <Input
              id="team2Name"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.currentTarget.value)}
            ></Input>
          </div>
          <Button
            variant="contained"
            onClick={() => createPackage(packageName)}
            disabled={isAnalyzing}
          >
            作成
          </Button>
        </Box>
      )}

      {isAnalyzing && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 2,
          }}
        >
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>音声同期を分析中...</Typography>
        </Box>
      )}
    </div>
  );
};
