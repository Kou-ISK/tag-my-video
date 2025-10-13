// 同期機能付きビデオプレイヤー

import { Box } from '@mui/material';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { MemoizedSingleVideoPlayer } from './SingleVideoPlayer';
import { VideoSyncData } from '../../types/VideoSync';
import videojs from 'video.js';

interface SyncedVideoPlayerProps {
  videoList: string[];
  isVideoPlaying: boolean;
  videoPlayBackRate: number;
  currentTime: number;
  setMaxSec: Dispatch<SetStateAction<number>>;
  syncData?: VideoSyncData;
  syncMode?: 'auto' | 'manual';
}

export const SyncedVideoPlayer = ({
  videoList,
  isVideoPlaying,
  videoPlayBackRate,
  currentTime,
  setMaxSec,
  syncData,
  syncMode = 'auto',
}: SyncedVideoPlayerProps) => {
  const [adjustedCurrentTimes, setAdjustedCurrentTimes] = useState<number[]>(
    [],
  );
  const [forceUpdateKey, setForceUpdateKey] = useState<number>(0);

  const allowSeek = syncMode === 'manual';

  // blockPlay配列を計算(useMemoで安定化し、不要な再レンダリングを防止)
  const blockPlayStates = useMemo(() => {
    const offset = syncData?.syncOffset || 0;
    return videoList.map((_, index) => {
      if (index === 0) {
        // Video_0 (基準映像) のブロック条件
        if (offset < 0) {
          return currentTime < Math.abs(offset);
        }
        return false;
      } else {
        // Video_1以降のブロック条件
        if (offset > 0) {
          return currentTime < offset;
        }
        return false;
      }
    });
  }, [currentTime, syncData?.syncOffset, videoList.length]);

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

  // 同期オフセットを考慮した再生時間の計算（堅牢化）
  useEffect(() => {
    if (videoList.length > 0) {
      const offset = syncData?.syncOffset || 0;
      const times = videoList.map((_, index) => {
        if (index === 0) {
          // 基準映像は負の時間にしない
          return Math.max(0, currentTime);
        }
        // 2本目以降: offset を適用。負のoffsetなら先行させるためにクランプしない
        const t = currentTime - offset;
        return offset < 0 ? Math.max(0, t) : t < 0 ? 0 : t;
      });
      setAdjustedCurrentTimes(times);
    }
  }, [currentTime, syncData?.syncOffset, videoList.length]);

  // Video.js 簡易型
  type VjsPlayerLite = {
    isDisposed?: () => boolean;
    paused?: () => boolean;
    play?: () => Promise<void> | void;
    muted?: (v: boolean) => void;
  };
  type VjsNSLite = { getPlayer?: (id: string) => VjsPlayerLite | undefined };

  // オフセット到達後に2本目以降の自動再生を確実に開始（保険）
  useEffect(() => {
    if (!isVideoPlaying) return;
    if (videoList.length < 2) return;

    const vjsNS = videojs as unknown as VjsNSLite;

    videoList.forEach((_, index) => {
      if (index === 0) return;
      const offset = syncData?.isAnalyzed ? syncData.syncOffset || 0 : 0;
      if (currentTime >= offset) {
        try {
          const p = vjsNS.getPlayer?.(`video_${index}`);
          if (p && !p.isDisposed?.() && p.paused?.()) {
            try {
              p.muted?.(false);
            } catch {
              /* ignore */
            }
            try {
              const r = p.play?.();
              if (r && typeof (r as Promise<void>).catch === 'function') {
                (r as Promise<void>).catch(async () => {
                  try {
                    p.muted?.(true);
                    await p.play?.();
                    p.muted?.(false);
                  } catch {
                    /* ignore */
                  }
                });
              }
            } catch {
              /* ignore */
            }
          }
        } catch {
          /* ignore */
        }
      }
    });
  }, [isVideoPlaying, currentTime, syncData?.syncOffset, videoList.length]);

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

                  const timeDiff = Math.abs(currentPlayerTime - adjustedTime);
                  // Player APIに依存せず、基礎のHTMLVideoElementから状態を取得
                  const videoEl: HTMLVideoElement | null =
                    player.el && player.el()
                      ? (player
                          .el()
                          .querySelector('video') as HTMLVideoElement | null)
                      : null;
                  const rs = videoEl ? videoEl.readyState : 0;
                  const isSeeking = videoEl ? videoEl.seeking : false;

                  if (
                    typeof currentPlayerTime === 'number' &&
                    !isNaN(currentPlayerTime) &&
                    timeDiff > 2.0 &&
                    rs >= 1 &&
                    !isSeeking
                  ) {
                    console.log(
                      `Video ${index}の時刻を${adjustedTime}秒に設定 (現在: ${currentPlayerTime}秒, 差分:${timeDiff}, readyState:${rs}, seeking:${isSeeking})`,
                    );

                    // シーク実行前にプレイヤーの状態を再確認
                    if (player.el() && !player.error()) {
                      requestAnimationFrame(() => {
                        try {
                          const ve: HTMLVideoElement | null =
                            player.el && player.el()
                              ? (player
                                  .el()
                                  .querySelector(
                                    'video',
                                  ) as HTMLVideoElement | null)
                              : null;
                          if (
                            player &&
                            !player.error() &&
                            !(ve && ve.seeking)
                          ) {
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

  // 基準プレイヤー(動画0)の再生開始を検知（負のオフセット用のブロック解除に利用）
  // useEffect(() => {
  //   // 再生停止時はリセット
  //   if (!isVideoPlaying) {
  //     setPrimaryStarted(false);
  //   }
  //   // Video.js 簡易型
  //   type VjsPlayerLite = {
  //     isDisposed?: () => boolean;
  //     paused?: () => boolean;
  //     on?: (ev: string, cb: () => void) => void;
  //     off?: (ev: string, cb: () => void) => void;
  //     currentTime?: () => number;
  //   };
  //   type VjsNSLite = { getPlayer?: (id: string) => VjsPlayerLite | undefined };
  //   try {
  //     const vjsNS = videojs as unknown as VjsNSLite;
  //     const p0 = vjsNS.getPlayer?.('video_0');
  //     if (!p0 || p0.isDisposed?.()) return;
  //     // 既に再生状態なら即反映
  //     try {
  //       if (p0.paused && p0.paused() === false) {
  //         setPrimaryStarted(true);
  //       }
  //     } catch {}
  //     const onPlaying = () => setPrimaryStarted(true);
  //     const onTimeUpdate = () => {
  //       try {
  //         const t = p0.currentTime ? p0.currentTime() || 0 : 0;
  //         if (typeof t === 'number' && t > 0.01) setPrimaryStarted(true);
  //       } catch {}
  //     };
  //     p0.on?.('playing', onPlaying);
  //     p0.on?.('timeupdate', onTimeUpdate);
  //     return () => {
  //       try {
  //         p0.off?.('playing', onPlaying);
  //         p0.off?.('timeupdate', onTimeUpdate);
  //       } catch {}
  //     };
  //   } catch {}
  // }, [isVideoPlaying, videoList.length]);

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
        width: '100%',
        margin: 0,
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative',
        height: 'auto',
        maxHeight: 'none',
        flexWrap: 'nowrap',
        gap: 0,
        boxSizing: 'border-box',
        backgroundColor: '#000',
        overflow: 'visible',
      }}
    >
      {videoList !== undefined &&
        videoList.map((filePath, index) => {
          if (!filePath || filePath.trim() === '') {
            return null;
          }

          // 2本目以降に同期オフセットを適用し、開始前（currentTime < offset）は再生ブロック
          // const offset =
          //   index > 0 && syncData?.isAnalyzed ? syncData?.syncOffset || 0 : 0;

          return (
            <Box
              key={index}
              sx={{
                width: '50%',
                flex: '0 0 50%',
                minWidth: 0,
                padding: 0,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '100%',
                  aspectRatio: '16/9',
                  backgroundColor: '#000',
                  display: 'flex',
                }}
              >
                <MemoizedSingleVideoPlayer
                  videoSrc={filePath}
                  id={`video_${index}`}
                  isVideoPlaying={isVideoPlaying}
                  videoPlayBackRate={videoPlayBackRate}
                  currentTime={adjustedCurrentTimes[index] || currentTime}
                  setMaxSec={index === 0 ? setMaxSec : () => void 0}
                  forceUpdate={forceUpdateKey}
                  blockPlay={blockPlayStates[index] || false}
                  allowSeek={allowSeek}
                />
              </Box>
            </Box>
          );
        })}
    </Box>
  );
};
