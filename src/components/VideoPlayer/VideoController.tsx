import { Box, Button, Slider, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import videojs from 'video.js';
import { VideoSyncData } from '../../types/VideoSync';

interface VideoControllerProps {
  setIsVideoPlaying: Dispatch<SetStateAction<boolean>>;
  isVideoPlaying: boolean;
  setVideoPlayBackRate: Dispatch<SetStateAction<number>>;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  handleCurrentTime: (event: Event, newValue: number | number[]) => void;
  maxSec: number;
  videoList: string[];
  syncData?: VideoSyncData;
  resyncAudio?: () => void;
  resetSync?: () => void;
  adjustSyncOffset?: () => void;
}

export const VideoController = ({
  setIsVideoPlaying,
  isVideoPlaying,
  setVideoPlayBackRate,
  setCurrentTime,
  handleCurrentTime,
  maxSec,
  videoList,
  syncData,
  resyncAudio,
  resetSync,
  adjustSyncOffset,
}: VideoControllerProps) => {
  const [videoTime, setVideoTime] = useState<number>(0); // Sliderで表示される映像の再生時間を管理

  // 映像の再生位置を監視（同期処理はSyncedVideoPlayerに委譲）
  useEffect(() => {
    const players = videoList.map((_, index) => videojs(`video_${index}`));

    const updateTimeHandler = () => {
      const primaryPlayer = players[0];
      if (primaryPlayer) {
        const newVideoTime = primaryPlayer.currentTime();
        if (newVideoTime !== undefined) {
          setVideoTime(newVideoTime);
        }
      }
    };

    // 基準となる最初のプレイヤーのみ監視
    const primaryPlayer = players[0];
    if (primaryPlayer) {
      primaryPlayer.on('timeupdate', updateTimeHandler);
    }

    return () => {
      if (primaryPlayer) {
        primaryPlayer.off('timeupdate', updateTimeHandler);
      }
    };
  }, [videoList]);

  // 同期データが変更された時の処理は不要（SyncedVideoPlayerが担当）
  // useEffect(() => { ... }, [syncData?.syncOffset, syncData?.isAnalyzed, videoList.length]);

  // キーボードショートカットのイベントリスナー
  useEffect(() => {
    window.electronAPI.on('video-shortcut-event', (event, args) => {
      if (args > 0) {
        setVideoPlayBackRate(args);
        if (args === 1) {
          setIsVideoPlaying(!isVideoPlaying);
        }
      } else {
        setCurrentTime(videoTime + args);
      }
    });
  }, [isVideoPlaying, videoTime]);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Button onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
          {isVideoPlaying ? 'Pause All' : 'Play All'}
        </Button>
        <Button onClick={() => setCurrentTime(videoTime - 10)}>10秒戻る</Button>
        <Button onClick={() => setCurrentTime(videoTime - 5)}>5秒戻る</Button>
        <Button onClick={() => setVideoPlayBackRate(0.5)}>0.5倍速</Button>
        <Button onClick={() => setVideoPlayBackRate(1)}>1倍速</Button>
        <Button onClick={() => setVideoPlayBackRate(2)}>2倍速</Button>
        <Button onClick={() => setVideoPlayBackRate(6)}>6倍速</Button>

        {/* 同期機能ボタン（2つ以上の映像がある場合のみ表示） */}
        {videoList.length > 1 && (
          <>
            <Button
              onClick={resyncAudio}
              variant="outlined"
              size="small"
              sx={{ ml: 2 }}
              disabled={!resyncAudio}
            >
              同期再実行
            </Button>
            <Button
              onClick={resetSync}
              variant="outlined"
              size="small"
              color="warning"
              disabled={!resetSync}
            >
              同期リセット
            </Button>
            <Button
              onClick={adjustSyncOffset}
              variant="outlined"
              size="small"
              disabled={!adjustSyncOffset || !syncData?.isAnalyzed}
            >
              オフセット調整
            </Button>
          </>
        )}

        <Box sx={{ paddingLeft: '30px' }} width={500}>
          <Slider
            aria-label="Time"
            valueLabelDisplay="auto"
            value={videoTime}
            onChange={handleCurrentTime}
            min={0}
            max={maxSec}
          />
          {syncData?.isAnalyzed && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '10px',
                color: 'text.secondary',
                display: 'block',
                textAlign: 'center',
              }}
            >
              同期済み: {syncData.syncOffset.toFixed(2)}秒オフセット (信頼度:{' '}
              {((syncData.confidenceScore || 0) * 100).toFixed(0)}%)
              <br />
              <span style={{ fontSize: '8px', color: 'text.disabled' }}>
                Cmd+Shift+S: 再同期 | Cmd+Shift+R: リセット | Cmd+Shift+O: 調整
              </span>
            </Typography>
          )}
          {syncData && !syncData.isAnalyzed && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '10px',
                color: 'warning.main',
                display: 'block',
                textAlign: 'center',
              }}
            >
              同期未完了 - 「同期再実行」ボタンで同期を開始
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};
