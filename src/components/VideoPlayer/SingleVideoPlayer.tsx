import { Box } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface SingleVideoPlayerProps {
  videoSrc: string;
  id: string;
  isVideoPlaying: boolean;
  videoPlayBackRate: number;
  currentTime: number;
  setMaxSec: Dispatch<SetStateAction<number>>;
  forceUpdate?: number; // 強制更新用のキー
}

export const SingleVideoPlayer: React.FC<SingleVideoPlayerProps> = ({
  videoSrc,
  id,
  isVideoPlaying,
  videoPlayBackRate,
  currentTime,
  setMaxSec,
  forceUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  // Video.jsプレイヤーの初期化（一度だけ）
  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const option = { autoplay: false, aspectRatio: '16:9' };
      playerRef.current = videojs(videoRef.current, option);

      playerRef.current.ready(() => {
        // プレイヤーが完全に準備完了してからdurationを取得
        const setDuration = () => {
          const duration = playerRef.current?.duration();
          if (
            typeof duration === 'number' &&
            !isNaN(duration) &&
            duration > 0
          ) {
            setMaxSec(duration);
            console.log(`${id}: duration設定: ${duration}秒`);
          } else {
            console.debug(`${id}: duration取得失敗, 再試行します`);
            // durationが取得できない場合は少し待ってから再試行
            setTimeout(() => {
              const retryDuration = playerRef.current?.duration();
              if (
                typeof retryDuration === 'number' &&
                !isNaN(retryDuration) &&
                retryDuration > 0
              ) {
                setMaxSec(retryDuration);
                console.log(`${id}: duration再試行で設定: ${retryDuration}秒`);
              } else {
                console.warn(`${id}: duration取得に失敗しました`);
                setMaxSec(100); // フォールバック値
              }
            }, 2000);
          }
        };

        // メタデータが読み込まれてからdurationを設定
        playerRef.current.on('loadedmetadata', setDuration);

        // すでにメタデータが読み込まれている場合は即座に実行
        setTimeout(setDuration, 100);
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [setMaxSec, id]);

  // 映像ソースの変更
  useEffect(() => {
    if (playerRef.current && videoSrc) {
      playerRef.current.src({ src: videoSrc, type: 'video/mp4' });
    }
  }, [videoSrc]);

  // 再生状態の制御
  useEffect(() => {
    if (playerRef.current) {
      if (isVideoPlaying) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  }, [isVideoPlaying]);

  // 再生速度の制御
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playbackRate(videoPlayBackRate);
    }
  }, [videoPlayBackRate]);

  // 現在時刻の制御
  useEffect(() => {
    if (
      playerRef.current &&
      typeof currentTime === 'number' &&
      !isNaN(currentTime) &&
      currentTime >= 0
    ) {
      try {
        const currentPlayerTime = playerRef.current.currentTime();
        // フリッカリング防止：より大きな閾値を使用し、シーク処理を最適化
        if (
          typeof currentPlayerTime === 'number' &&
          !isNaN(currentPlayerTime) &&
          Math.abs(currentPlayerTime - currentTime) > 1.0 // 1秒以上の差がある場合のみ更新
        ) {
          console.log(
            `${id}: 時刻を${currentTime}秒に設定 (現在: ${currentPlayerTime}秒)`,
          );

          // フリッカリング防止のため、シークを非同期で実行
          requestAnimationFrame(() => {
            if (playerRef.current) {
              playerRef.current.currentTime(currentTime);
            }
          });
        }
      } catch (error) {
        console.debug(`${id}: 時刻設定エラー:`, error);
      }
    }
  }, [currentTime, id]); // forceUpdateを依存関係から除去

  // 強制更新処理を別のuseEffectに分離
  useEffect(() => {
    if (forceUpdate && forceUpdate > 0) {
      console.log(`${id}: 強制更新実行 (key: ${forceUpdate})`);

      // 強制更新時のみ即座にシークを実行
      if (
        playerRef.current &&
        typeof currentTime === 'number' &&
        !isNaN(currentTime) &&
        currentTime >= 0
      ) {
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.currentTime(currentTime);
          }
        }, 100); // 短いディレイで実行
      }
    }
  }, [forceUpdate, currentTime, id]);

  console.log('videoSrc:', videoSrc);
  return (
    <Box width="50%" height="100%">
      <video
        ref={videoRef}
        className="video-js"
        preload="auto"
        width="640"
        height="360"
        id={id}
        controls
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </Box>
  );
};
