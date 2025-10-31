import {
  Box,
  Paper,
  Stack,
  Typography,
  Snackbar,
  Alert,
  AlertTitle,
  Backdrop,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { VideoController } from '../components/VideoPlayer/VideoController';
import { VideoPathSelector } from '../components/VideoPlayer/VideoPathSelector';
import { VisualTimeline } from '../components/VideoPlayer/VisualTimeline';
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
    isAnalyzing,
    syncProgress,
    syncStage,
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gridTemplateRows: '1fr auto',
            gap: 2,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* 左上: 映像プレイヤー */}
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: { xs: 1.5, md: 2 },
              overflow: 'hidden',
            }}
          >
            <VideoPlayer
              key={videoList.join('|')}
              videoList={videoList}
              isVideoPlaying={isVideoPlaying}
              videoPlayBackRate={videoPlayBackRate}
              currentTime={currentTime}
              setMaxSec={setMaxSec}
              syncData={syncData}
              syncMode={syncMode}
              forceUpdateKey={playerForceUpdateKey}
            />
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
          </Paper>

          {/* 右: CodePanel（固定サイドバー） */}
          <Paper
            variant="outlined"
            sx={{
              gridRow: '1 / 3',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              p: { xs: 1.5, md: 2 },
            }}
          >
            <CodePanel
              metaDataConfigFilePath={metaDataConfigFilePath}
              addTimelineData={addTimelineData}
              teamNames={teamNames}
              setTeamNames={setTeamNames}
            />
          </Paper>

          {/* 下: ビジュアルタイムライン */}
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              height: '280px',
            }}
          >
            <VisualTimeline
              timeline={timeline}
              maxSec={maxSec}
              currentTime={currentTime}
              onSeek={(time) => {
                const event = new Event('visual-timeline-seek');
                handleCurrentTime(event, time);
              }}
              onDelete={deleteTimelineDatas}
              selectedIds={selectedTimelineIdList}
              onSelectionChange={(ids) => {
                // 選択状態を更新
                const updatedTimeline = timeline.map((item) => ({
                  ...item,
                  isSelected: ids.includes(item.id),
                }));
                setTimeline(updatedTimeline);
              }}
            />
          </Paper>
        </Box>
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

      {/* 音声同期中の全画面オーバーレイ */}
      <Backdrop
        open={isAnalyzing}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          color: '#fff',
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        <Card
          sx={{
            minWidth: 400,
            maxWidth: 500,
            backgroundColor: 'background.paper',
          }}
        >
          <CardContent>
            <Stack spacing={3} alignItems="center">
              {/* アニメーションアイコン */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress
                  size={80}
                  thickness={4}
                  sx={{ color: 'primary.main' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GraphicEqIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </Box>

              {/* タイトル */}
              <Typography variant="h6" component="div" fontWeight="medium">
                音声同期分析中
              </Typography>

              {/* ステージ説明 */}
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                {syncStage || '音声データを解析しています...'}
              </Typography>

              {/* プログレスバー */}
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={syncProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                >
                  {Math.round(syncProgress)}%
                </Typography>
              </Box>

              {/* 注意書き */}
              <Alert severity="warning" sx={{ width: '100%' }}>
                <Typography variant="caption">
                  音声同期の精度向上のため、処理には時間がかかる場合があります。
                  この間、他の操作はできません。
                </Typography>
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Backdrop>
    </Box>
  );
};
