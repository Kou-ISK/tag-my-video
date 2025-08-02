// 同期機能付きビデオプレイヤー

import { Box } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SingleVideoPlayer } from './SingleVideoPlayer';
import { VideoSyncData } from '../../types/VideoSync';

interface SyncedVideoPlayerProps {
  videoList: string[];
  isVideoPlaying: boolean;
  videoPlayBackRate: number;
  currentTime: number;
  setMaxSec: Dispatch<SetStateAction<number>>;
  syncData?: VideoSyncData;
}

export const SyncedVideoPlayer = ({
  videoList,
  isVideoPlaying,
  videoPlayBackRate,
  currentTime,
  setMaxSec,
  syncData,
}: SyncedVideoPlayerProps) => {
  const [adjustedCurrentTimes, setAdjustedCurrentTimes] = useState<number[]>(
    [],
  );
  const [forceUpdateKey, setForceUpdateKey] = useState<number>(0);

  // 同期オフセットを考慮した再生時間の計算
  useEffect(() => {
    if (videoList.length > 0) {
      const times = videoList.map((_, index) => {
        if (index === 0) {
          return currentTime; // 最初の映像は基準時間
        }
        // 2番目の映像は同期オフセットを適用
        // オフセットが正の場合: 2番目の映像が遅れているので、基準時間から引く
        // オフセットが負の場合: 2番目の映像が進んでいるので、基準時間に足す
        const offset = syncData?.syncOffset || 0;
        return Math.max(0, currentTime - offset);
      });
      setAdjustedCurrentTimes(times);
    }
  }, [currentTime, syncData, videoList.length]);

  // デバッグ用：同期データの変更を監視
  useEffect(() => {
    if (syncData) {
      console.log('同期データが更新されました:', {
        offset: syncData.syncOffset,
        isAnalyzed: syncData.isAnalyzed,
        confidence: syncData.confidenceScore,
      });

      // 同期データが変更された場合、adjustedCurrentTimesを強制的に再計算
      if (videoList.length > 0) {
        const times = videoList.map((_, index) => {
          if (index === 0) {
            return currentTime; // 最初の映像は基準時間
          }
          const offset = syncData.syncOffset || 0;
          return Math.max(0, currentTime - offset);
        });
        setAdjustedCurrentTimes(times);
        console.log('調整済み再生時間を更新:', times);

        // 強制更新キーを更新してプレイヤーを強制更新
        setForceUpdateKey((prev) => prev + 1);

        // Video.jsプレイヤーを直接操作して即座に同期を反映
        setTimeout(() => {
          videoList.forEach((_, index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const player = (window as any).videojs(`video_${index}`);
            if (player && index > 0) {
              const adjustedTime = Math.max(
                0,
                currentTime - (syncData.syncOffset || 0),
              );
              console.log(`Video ${index}の時刻を${adjustedTime}秒に設定`);
              player.currentTime(adjustedTime);
            }
          });
        }, 100); // 少し遅延させてプレイヤーが準備完了するのを待つ
      }
    }
  }, [syncData, currentTime, videoList.length]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        margin: '0px',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {videoList !== undefined &&
        videoList.map((filePath, index) => (
          <SingleVideoPlayer
            key={`${index}-${forceUpdateKey}`} // forceUpdateKeyをkeyに含める
            videoSrc={filePath}
            id={'video_' + index}
            isVideoPlaying={isVideoPlaying}
            videoPlayBackRate={videoPlayBackRate}
            currentTime={adjustedCurrentTimes[index] || currentTime}
            setMaxSec={setMaxSec}
            forceUpdate={forceUpdateKey}
          />
        ))}

      {/* 同期状態インジケーター */}
      {syncData && syncData.isAnalyzed && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor:
              syncData.confidenceScore && syncData.confidenceScore > 0.8
                ? 'rgba(0, 128, 0, 0.8)' // 高信頼度は緑
                : 'rgba(255, 165, 0, 0.8)', // 低信頼度はオレンジ
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000,
            minWidth: '200px',
          }}
        >
          <div>🎯 同期済み</div>
          <div>オフセット: {syncData.syncOffset.toFixed(3)}秒</div>
          {syncData.confidenceScore && (
            <div>信頼度: {(syncData.confidenceScore * 100).toFixed(1)}%</div>
          )}
          <div style={{ fontSize: '10px', marginTop: '4px' }}>
            {syncData.confidenceScore && syncData.confidenceScore > 0.8
              ? '✅ 高精度同期'
              : '⚠️ 要確認'}
          </div>
        </Box>
      )}

      {syncData && !syncData.isAnalyzed && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000,
          }}
        >
          ❌ 同期未完了
        </Box>
      )}
    </Box>
  );
};
