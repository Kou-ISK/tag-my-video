import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Snackbar,
  Alert,
  AlertTitle,
} from '@mui/material';
import { VideoController } from '../components/VideoPlayer/VideoController';
import { VideoPathSelector } from '../components/VideoPlayer/VideoPathSelector';
import { TimelineTable } from '../components/VideoPlayer/TimelineTable';
import { CodePanel } from '../components/VideoPlayer/CodePanel';
import { useVideoPlayerApp } from '../hooks/useVideoPlayerApp';
import { StatsModal } from '../components/VideoPlayer/StatsModal';
import React, { useEffect } from 'react';
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer';

export const VideoPlayerApp = () => {
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
    playerForceUpdateKey,
    error,
    setError,
  } = useVideoPlayerApp();

  // エラーメッセージの生成
  const getErrorTitle = (type: string) => {
    switch (type) {
      case 'file':
        return 'ファイルエラー';
      case 'network':
        return 'ネットワークエラー';
      case 'sync':
        return '音声同期エラー';
      case 'playback':
        return '再生エラー';
      default:
        return 'エラー';
    }
  };

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
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: { xs: 1.5, md: 3 },
        bgcolor: 'background.default',
      }}
    >
      {isFileSelected ? (
        <Stack sx={{ flex: 1, minHeight: 0 }} spacing={2}>
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: { xs: 1.5, md: 2 },
              height: { xs: '40vh', sm: '50vh', md: '55vh', lg: '60vh' },
              minHeight: '300px',
              maxHeight: '800px',
            }}
          >
            <VideoPlayer
              key={videoList.join('|')} // videoListが変わった時のみ再マウント
              videoList={videoList}
              isVideoPlaying={isVideoPlaying}
              videoPlayBackRate={videoPlayBackRate}
              currentTime={currentTime}
              setMaxSec={setMaxSec}
              syncData={syncData}
              syncMode={syncMode}
              forceUpdateKey={playerForceUpdateKey}
            />
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <VideoController
                  setIsVideoPlaying={setisVideoPlaying}
                  isVideoPlaying={isVideoPlaying}
                  setVideoPlayBackRate={setVideoPlayBackRate}
                  setCurrentTime={setCurrentTime}
                  currentTime={currentTime}
                  handleCurrentTime={handleCurrentTime}
                  maxSec={maxSec}
                  videoList={videoList}
                  syncData={syncData}
                />
              </Box>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="flex-end"
                sx={{ flexShrink: 0 }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => deleteTimelineDatas(selectedTimelineIdList)}
                >
                  選択を削除
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (window.electronAPI) {
                      window.electronAPI.exportTimeline(
                        timelineFilePath,
                        timeline,
                      );
                    } else {
                      alert(
                        'この機能はElectronアプリケーション内でのみ利用できます。',
                      );
                    }
                  }}
                >
                  タイムラインを保存
                </Button>
              </Stack>
            </Stack>
          </Paper>
          <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            <Grid item xs={12} lg={7} sx={{ display: 'flex', minHeight: 0 }}>
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  minHeight: { xs: '300px', md: '400px' },
                }}
              >
                <TimelineTable
                  timelineFilePath={timelineFilePath}
                  handleCurrentTime={handleCurrentTime}
                  timeline={timeline}
                  setTimeline={setTimeline}
                  getSelectedTimelineId={getSelectedTimelineId}
                  updateQualifier={updateQualifier}
                  updateActionResult={updateActionResult}
                  updateActionType={updateActionType}
                  sortTimelineDatas={sortTimelineDatas}
                  currentTime={currentTime}
                  selectedTimelineIds={selectedTimelineIdList}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} lg={5} sx={{ display: 'flex', minHeight: 0 }}>
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  p: { xs: 1.5, md: 2 },
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  アクション入力
                </Typography>
                <CodePanel
                  metaDataConfigFilePath={metaDataConfigFilePath}
                  addTimelineData={addTimelineData}
                  teamNames={teamNames}
                  setTeamNames={setTeamNames}
                />
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, md: 4 },
          }}
        >
          <VideoPathSelector
            setVideoList={setVideoList}
            setIsFileSelected={setIsFileSelected}
            isFileSelected={isFileSelected}
            setTimelineFilePath={setTimelineFilePath}
            setPackagePath={setPackagePath}
            setMetaDataConfigFilePath={setMetaDataConfigFilePath}
            setSyncData={setSyncData}
          />
        </Paper>
      )}
      <StatsModal timeline={timeline} teamNames={teamNames} />

      {/* エラー通知 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          <AlertTitle>{error && getErrorTitle(error.type)}</AlertTitle>
          {error?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
