import { Box, Button, Slider, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import videojs from 'video.js';
import { VideoSyncData } from '../../types/VideoSync';

interface VideoControllerProps {
  setIsVideoPlaying: Dispatch<SetStateAction<boolean>>;
  isVideoPlaying: boolean;
  setVideoPlayBackRate: Dispatch<SetStateAction<number>>;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  handleCurrentTime: (
    event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => void;
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

  // videoTimeがNaNになった場合の修正
  useEffect(() => {
    if (isNaN(videoTime)) {
      console.warn('videoTimeがNaNになっています。0にリセットします。');
      setVideoTime(0);
    }
  }, [videoTime]);

  // 映像の再生位置を監視（共通シークバーとの連動）
  useEffect(() => {
    if (videoList.length === 0) return;

    let intervalId: NodeJS.Timeout;
    let animationFrameId: number;

    const updateTimeHandler = () => {
      try {
        const primaryPlayer = videojs(`video_0`);
        if (primaryPlayer) {
          let duration = 0;
          try {
            const dur = primaryPlayer.duration
              ? primaryPlayer.duration()
              : undefined;
            duration = typeof dur === 'number' && !isNaN(dur) ? dur : 0;
          } catch (durationError) {
            duration = 0;
          }

          if (
            typeof duration === 'number' &&
            !isNaN(duration) &&
            duration > 0
          ) {
            let newVideoTime = 0;
            try {
              newVideoTime = primaryPlayer.currentTime() || 0;
            } catch (timeError) {
              newVideoTime = 0;
            }

            if (
              typeof newVideoTime === 'number' &&
              !isNaN(newVideoTime) &&
              newVideoTime >= 0
            ) {
              // より細かい更新間隔でスムーズなシークバー移動を実現
              if (Math.abs(newVideoTime - videoTime) > 0.05) {
                setVideoTime(newVideoTime);
              }
            }
          }
        }
      } catch (error) {
        console.debug('プレイヤーアクセスエラー:', error);
      }
    };

    const animationUpdateHandler = () => {
      updateTimeHandler();
      animationFrameId = requestAnimationFrame(animationUpdateHandler);
    };

    // プレイヤーの準備ができるまで待つ
    const timer = setTimeout(() => {
      try {
        const primaryPlayer = videojs(`video_0`);
        if (primaryPlayer) {
          primaryPlayer.ready(() => {
            // timeupdate イベントでリアルタイム更新
            primaryPlayer.on('timeupdate', updateTimeHandler);

            // アニメーションフレームベースでスムーズ更新（再生中のみ）
            if (isVideoPlaying) {
              animationFrameId = requestAnimationFrame(animationUpdateHandler);
            }

            // ポーリングによるバックアップ
            intervalId = setInterval(updateTimeHandler, 200);
          });
        }
      } catch (error) {
        console.debug('プレイヤー初期化待機中:', error);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      try {
        const primaryPlayer = videojs(`video_0`);
        if (primaryPlayer) {
          primaryPlayer.off('timeupdate', updateTimeHandler);
        }
      } catch (error) {
        console.debug('プレイヤークリーンアップエラー:', error);
      }
    };
  }, [videoList, isVideoPlaying]); // videoTimeを依存関係から除去して無限ループを防止

  // 同期データが変更された時の処理は不要（SyncedVideoPlayerが担当）
  // useEffect(() => { ... }, [syncData?.syncOffset, syncData?.isAnalyzed, videoList.length]);

  // キーボードショートカットのイベントリスナー（Electron環境でのみ実行）
  useEffect(() => {
    if (window.electronAPI && typeof window.electronAPI.on === 'function') {
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
    } else {
      console.log('ブラウザ環境: Electron APIは利用できません');
    }
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
            value={
              typeof videoTime === 'number' &&
              !isNaN(videoTime) &&
              videoTime >= 0
                ? videoTime
                : 0
            }
            onChange={handleCurrentTime}
            min={0}
            max={
              typeof maxSec === 'number' && !isNaN(maxSec) && maxSec > 0
                ? maxSec
                : 100
            }
            step={0.1} // より細かいステップでスムーズな操作
            disabled={maxSec <= 0 || isNaN(maxSec)} // 無効な値の場合はスライダーを無効化
            sx={{
              '& .MuiSlider-thumb': {
                transition: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms', // スムーズなアニメーション
              },
              '& .MuiSlider-track': {
                transition: 'none', // トラックのアニメーションを無効にしてパフォーマンス向上
              },
            }}
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
