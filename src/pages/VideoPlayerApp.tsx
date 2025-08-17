import { Box, Button } from '@mui/material';
import { VideoController } from '../components/VideoPlayer/VideoController';
import { VideoPathSelector } from '../components/VideoPlayer/VideoPathSelector';
import { TimelineTable } from '../components/VideoPlayer/TimelineTable';
import { CodePanel } from '../components/VideoPlayer/CodePanel';
import { useVideoPlayerApp } from '../hooks/useVideoPlayerApp';
import { StatsModal } from '../components/VideoPlayer/StatsModal';
import React, { useEffect } from 'react';
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer';

export const VideoPlayerApp = () => {
  console.log(
    '🚀 VideoPlayerApp: アプリケーション起動',
    new Date().toISOString(),
  );

  const {
    timeline,
    setTimeline,
    selectedTimelineIdList,
    videoList,
    setVideoList,
    currentTime,
    setCurrentTime,
    timelineFilePath,
    setTimelineFilePath,
    metaDataConfigFilePath,
    setMetaDataConfigFilePath,
    teamNames,
    setTeamNames,
    isFileSelected,
    setIsFileSelected,
    maxSec,
    setMaxSec,
    isVideoPlaying,
    setisVideoPlaying,
    videoPlayBackRate,
    setVideoPlayBackRate,
    syncData,
    setSyncData,
    syncMode,
    setSyncMode,
    handleCurrentTime,
    setPackagePath,
    addTimelineData,
    deleteTimelineDatas,
    updateQualifier,
    updateActionResult,
    updateActionType,
    getSelectedTimelineId,
    sortTimelineDatas,
    resyncAudio,
    resetSync,
    manualSyncFromPlayers,
  } = useVideoPlayerApp();

  // デバッグ: videoListの変更を監視
  useEffect(() => {
    console.log('=== VideoPlayerApp: videoList changed ===', {
      length: videoList.length,
      list: videoList,
      isFileSelected,
      hasSecondVideo: videoList.length > 1,
      secondVideoDetails:
        videoList.length > 1
          ? {
              path: videoList[1],
              valid: !!videoList[1] && videoList[1].trim() !== '',
              type: typeof videoList[1],
            }
          : null,
    });
  }, [videoList, isFileSelected]);

  // メニューからの同期イベントを処理（Electron環境でのみ実行）
  useEffect(() => {
    if (window.electronAPI) {
      const onResync = () => {
        console.log('メニューから音声同期再実行');
        resyncAudio();
      };
      const onReset = () => {
        console.log('メニューから同期リセット');
        resetSync();
      };
      const onManual = () => {
        console.log('メニューから今の位置で同期');
        manualSyncFromPlayers();
      };
      const onSetMode = (mode: 'auto' | 'manual') => {
        console.log('メニューから同期モード切替:', mode);
        setSyncMode(mode);
      };

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
        } catch (e) {
          console.debug('メニューイベントの解除エラー', e);
        }
      };
    }
  }, [resyncAudio, resetSync, manualSyncFromPlayers, setSyncMode]);

  return (
    <>
      {isFileSelected && (
        <>
          <VideoPlayer
            videoList={videoList}
            isVideoPlaying={isVideoPlaying}
            videoPlayBackRate={videoPlayBackRate}
            currentTime={currentTime}
            setMaxSec={setMaxSec}
            syncData={syncData}
            syncMode={syncMode}
          />
          <Box sx={{ maxHeight: '5vh', display: 'flex', flexDirection: 'row' }}>
            <VideoController
              setIsVideoPlaying={setisVideoPlaying}
              isVideoPlaying={isVideoPlaying}
              setVideoPlayBackRate={setVideoPlayBackRate}
              setCurrentTime={setCurrentTime}
              handleCurrentTime={handleCurrentTime}
              maxSec={maxSec}
              videoList={videoList}
              syncData={syncData}
            />
            <Button onClick={() => deleteTimelineDatas(selectedTimelineIdList)}>
              選択したデータを削除
            </Button>
            <Button
              onClick={() => {
                if (window.electronAPI) {
                  window.electronAPI.exportTimeline(timelineFilePath, timeline);
                } else {
                  alert(
                    'この機能はElectronアプリケーション内でのみ利用できます。',
                  );
                }
              }}
            >
              タイムラインを保存
            </Button>
          </Box>
          <Box
            sx={{
              maxHeight: '50vh',
              display: 'flex',
              flexDirection: 'row',
              alignContent: 'space-between',
            }}
          >
            <TimelineTable
              timelineFilePath={timelineFilePath}
              setCurrentTime={setCurrentTime}
              timeline={timeline}
              setTimeline={setTimeline}
              getSelectedTimelineId={getSelectedTimelineId}
              updateQualifier={updateQualifier}
              updateActionResult={updateActionResult}
              updateActionType={updateActionType}
              sortTimelineDatas={sortTimelineDatas}
            />
            <CodePanel
              metaDataConfigFilePath={metaDataConfigFilePath}
              addTimelineData={addTimelineData}
              teamNames={teamNames}
              setTeamNames={setTeamNames}
            />
          </Box>
          <StatsModal timeline={timeline} teamNames={teamNames} />
        </>
      )}

      {!isFileSelected && (
        <VideoPathSelector
          setVideoList={setVideoList}
          setIsFileSelected={setIsFileSelected}
          isFileSelected={isFileSelected}
          setTimelineFilePath={setTimelineFilePath}
          setPackagePath={setPackagePath}
          setMetaDataConfigFilePath={setMetaDataConfigFilePath}
          setSyncData={setSyncData}
        />
      )}
    </>
  );
};
