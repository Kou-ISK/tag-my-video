// 同期機能付きビデオプレイヤー

import { Box } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SingleVideoPlayer } from './SingleVideoPlayer';
import { VideoSyncData } from '../../types/VideoSync';
import videojs from 'video.js';

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

  // スタートアップデバッグ - アプリ起動時の状態確認
  console.log('🚀 SyncedVideoPlayer: コンポーネント起動', {
    videoListLength: videoList.length,
    videoList: videoList,
    timestamp: new Date().toISOString(),
  });

  // デバッグ用：videoListの変更を監視
  useEffect(() => {
    console.log('=== SyncedVideoPlayer: videoListが変更されました ===');
    console.log('映像数:', videoList.length);
    console.log('videoList配列の内容:', videoList);

    videoList.forEach((path, index) => {
      console.log(`映像${index}:`, {
        path: path,
        type: typeof path,
        length: path?.length,
        isEmpty: !path || path.trim() === '',
        isValidPath: path && path.startsWith('/'),
      });

      // Electronを使ったファイル存在確認
      if (path && path.trim() !== '' && window.electronAPI) {
        window.electronAPI
          .checkFileExists(path)
          .then((exists) => {
            console.log(`Video ${index}: ファイル存在確認結果:`, {
              path: path,
              exists: exists,
            });
            if (!exists) {
              console.error(`Video ${index}: ファイルが存在しません: ${path}`);
            }
          })
          .catch((error) => {
            console.error(`Video ${index}: ファイル存在確認エラー:`, error);
          });
      }

      // ファイルアクセステスト
      if (path && path.trim() !== '') {
        const fileUrl = path.startsWith('file://') ? path : `file://${path}`;

        // テスト用のビデオ要素を作成してファイルアクセスを確認
        const testVideo = document.createElement('video');
        testVideo.preload = 'metadata';

        const testLoadStart = () => {
          console.log(`Video ${index}: ファイルアクセス成功 - loadstart`);
        };

        const testError = (e: Event) => {
          console.error(`Video ${index}: ファイルアクセスエラー:`, e);
          console.error(`Video ${index}: エラー詳細:`, testVideo.error);
        };

        const testCanPlay = () => {
          console.log(`Video ${index}: ファイル読み込み成功 - canplay`);
          // テスト完了後にクリーンアップ
          testVideo.removeEventListener('loadstart', testLoadStart);
          testVideo.removeEventListener('error', testError);
          testVideo.removeEventListener('canplay', testCanPlay);
        };

        testVideo.addEventListener('loadstart', testLoadStart);
        testVideo.addEventListener('error', testError);
        testVideo.addEventListener('canplay', testCanPlay);

        console.log(`Video ${index}: ファイルアクセステスト開始:`, fileUrl);
        testVideo.src = fileUrl;
      }
    });

    // ファイルの存在確認（簡易版）
    if (videoList.length > 1) {
      console.log('二番目のビデオのパス詳細:', {
        secondVideoPath: videoList[1],
        isString: typeof videoList[1] === 'string',
        hasContent: !!videoList[1],
        trimmedLength: videoList[1]?.trim().length,
      });
    }
  }, [videoList]);

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

        // 強制更新は最小限に抑制（表示消失の原因を防ぐ）
        const shouldForceUpdate = !syncData.isAnalyzed && forceUpdateKey === 0; // 初回同期時のみ

        if (shouldForceUpdate) {
          console.log('強制更新キーを増加:', forceUpdateKey + 1);
          setForceUpdateKey((prev) => prev + 1);
        }

        // プレイヤー直接操作は非同期かつ慎重に実行
        setTimeout(() => {
          videoList.forEach((_, index) => {
            if (index === 0) return; // 基準動画はスキップ

            try {
              const player = videojs(`video_${index}`);
              // プレイヤーの健全性チェックを改善
              if (player && player.el() && !player.error()) {
                // ビデオ要素が実際に存在するかチェック
                const videoElement = player.el().querySelector('video');
                if (!videoElement) {
                  console.warn(`Video ${index}: ビデオ要素が見つかりません`);
                  return;
                }

                let duration = 0;
                try {
                  const dur = player.duration ? player.duration() : undefined;
                  duration = typeof dur === 'number' && !isNaN(dur) ? dur : 0;
                } catch (durationError) {
                  console.debug(
                    `Video ${index}: duration取得エラー:`,
                    durationError,
                  );
                  duration = 0;
                }

                if (
                  typeof duration === 'number' &&
                  !isNaN(duration) &&
                  duration > 0
                ) {
                  const offset = syncData.syncOffset || 0;
                  const adjustedTime = Math.max(0, currentTime - offset);

                  // 現在時刻との差が大きい場合のみシーク実行
                  let currentPlayerTime = 0;
                  try {
                    currentPlayerTime = player.currentTime() || 0;
                  } catch (timeError) {
                    console.debug(
                      `Video ${index}: currentTime取得エラー:`,
                      timeError,
                    );
                    currentPlayerTime = 0;
                  }

                  if (
                    typeof currentPlayerTime === 'number' &&
                    !isNaN(currentPlayerTime) &&
                    Math.abs(currentPlayerTime - adjustedTime) > 2.0 // 閾値を大きくして頻繁なシークを避ける
                  ) {
                    console.log(
                      `Video ${index}の時刻を${adjustedTime}秒に設定 (現在: ${currentPlayerTime}秒)`,
                    );

                    // シーク実行前にプレイヤーの状態を再確認
                    if (player.el() && !player.error()) {
                      requestAnimationFrame(() => {
                        try {
                          if (player && !player.error()) {
                            player.currentTime(adjustedTime);
                          }
                        } catch (seekError) {
                          console.warn(
                            `Video ${index}: シークエラー:`,
                            seekError,
                          );
                        }
                      });
                    }
                  }
                } else {
                  console.debug(`Video ${index}: duration無効 (${duration})`);
                }
              } else {
                console.warn(`Video ${index}: プレイヤー状態異常`, {
                  hasPlayer: !!player,
                  hasElement: player?.el?.(),
                  hasError: player?.error?.(),
                });
              }
            } catch (error) {
              console.error(`プレイヤー${index}の同期処理でエラー:`, error);
            }
          });
        }, 500); // 待機時間を延長してプレイヤーの安定性を向上
      }
    }
  }, [syncData?.syncOffset, syncData?.isAnalyzed, videoList.length]); // currentTimeを依存関係から削除して過度な更新を防止

  // デバッグ情報をログ出力
  console.log('SyncedVideoPlayer render:', {
    videoListLength: videoList.length,
    videoList: videoList,
    adjustedCurrentTimes: adjustedCurrentTimes,
    forceUpdateKey: forceUpdateKey,
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        margin: '0px',
        justifyContent: 'center',
        alignItems: 'stretch', // 子要素の高さを揃える
        position: 'relative',
        minHeight: '360px', // 最小高度を確保
        flexWrap: 'nowrap', // 折り返しを防ぐ
      }}
    >
      {videoList !== undefined &&
        videoList.map((filePath, index) => {
          // デバッグログ
          console.log(`=== Rendering video ${index} ===`, {
            filePath,
            exists: !!filePath,
            filePathLength: filePath?.length,
            isEmpty: !filePath || filePath.trim() === '',
            currentTime: adjustedCurrentTimes[index] || currentTime,
            forceUpdateKey: forceUpdateKey,
            videoListTotal: videoList.length,
            isSecondVideo: index === 1,
          });

          // 空のファイルパスをスキップ
          if (!filePath || filePath.trim() === '') {
            console.warn(`Video ${index}: 空のファイルパスのためスキップ`);
            return null;
          }

          console.log(
            `Video ${index}: SingleVideoPlayerコンポーネントを作成中...`,
          );

          const component = (
            <SingleVideoPlayer
              key={`${index}-${forceUpdateKey}`}
              videoSrc={filePath}
              id={'video_' + index}
              isVideoPlaying={isVideoPlaying}
              videoPlayBackRate={videoPlayBackRate}
              currentTime={adjustedCurrentTimes[index] || currentTime}
              setMaxSec={
                index === 0
                  ? setMaxSec
                  : () => {
                      /* 何もしない */
                    }
              }
              forceUpdate={forceUpdateKey}
            />
          );

          console.log(
            `Video ${index}: SingleVideoPlayerコンポーネント作成完了`,
            {
              component: component,
              key: `${index}-${forceUpdateKey}`,
            },
          );

          return component;
        })}

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
