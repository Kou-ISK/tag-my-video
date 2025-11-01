import {
  Box,
  IconButton,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import videojs from 'video.js';
import { VideoSyncData } from '../../types/VideoSync';
import { ShortcutGuide } from '../../components/ShortcutGuide';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Forward10Icon from '@mui/icons-material/Forward10';
import Forward30Icon from '@mui/icons-material/Forward30';
import Replay10Icon from '@mui/icons-material/Replay10';
import Replay30Icon from '@mui/icons-material/Replay30';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import SpeedIcon from '@mui/icons-material/Speed';

interface VideoControllerProps {
  setIsVideoPlaying: Dispatch<SetStateAction<boolean>>;
  isVideoPlaying: boolean;
  setVideoPlayBackRate: Dispatch<SetStateAction<number>>;
  videoPlayBackRate: number;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  currentTime: number; // タイムライン等からの外部シーク検知用
  handleCurrentTime: (
    event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => void;
  maxSec: number;
  videoList: string[];
  syncData?: VideoSyncData;
}

export const VideoController = ({
  setIsVideoPlaying,
  isVideoPlaying,
  setVideoPlayBackRate,
  videoPlayBackRate,
  setCurrentTime,
  currentTime,
  handleCurrentTime,
  maxSec,
  videoList,
  syncData,
}: VideoControllerProps) => {
  const [videoTime, setVideoTime] = useState<number>(0);
  const rafLastTsRef = useRef<number | null>(null);
  const lastSetCurrentTimeValueRef = useRef<number>(0); // 最後にsetCurrentTimeで設定した時間値
  const lastSetCurrentTimeTimestampRef = useRef<number>(0); // 最後にsetCurrentTimeを呼んだタイムスタンプ
  const isVideoPlayingRef = useRef<boolean>(isVideoPlaying); // 最新のisVideoPlaying値を保持
  // 初期値を-Infinityにして、起動直後の操作を阻害しない
  const lastManualSeekTimestamp = useRef<number>(-Infinity);
  const isSeekingRef = useRef<boolean>(false); // シーク中フラグ（RAF処理停止用）
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4, 6];
  const SMALL_SKIP_SECONDS = 10;
  const LARGE_SKIP_SECONDS = 30;
  const hasVideos = videoList.some((path) => path && path.trim() !== '');
  const [flashStates, setFlashStates] = useState<Record<string, boolean>>({});
  const flashTimeoutsRef = useRef<Record<string, number>>({});
  const speedPresets: Array<{
    label: string;
    value: number;
    icon: React.ReactNode;
  }> = [
    {
      label: '0.5x',
      value: 0.5,
      icon: <SlowMotionVideoIcon fontSize="small" />,
    },
    {
      label: '2x',
      value: 2,
      icon: <SpeedIcon fontSize="small" />,
    },
    {
      label: '4x',
      value: 4,
      icon: <SpeedIcon fontSize="small" />,
    },
    {
      label: '6x',
      value: 6,
      icon: <SpeedIcon fontSize="small" />,
    },
  ];

  // 時刻フォーマット関数（分:秒）
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // isVideoPlayingが変更されたらrefを更新
  useEffect(() => {
    isVideoPlayingRef.current = isVideoPlaying;
  }, [isVideoPlaying]);

  // 安全なsetCurrentTime関数（頻度制限付き）
  // maxSecを基準に異常値を検出(2時間を上限とする)
  const safeSetCurrentTime = (time: number, source = 'unknown') => {
    const maxAllowedTime = maxSec > 0 ? maxSec + 10 : 7200;
    if (time > maxAllowedTime) {
      console.error(
        `[ERROR] safeSetCurrentTime from ${source}: 異常に高い値 (${time}秒、上限=${maxAllowedTime}秒) の設定を阻止しました。`,
      );
      return;
    }
    if (isNaN(time) || time < 0) {
      console.error(
        `[ERROR] safeSetCurrentTime from ${source}: 無効な値 (${time}) の設定を阻止しました。`,
      );
      return;
    }

    // 頻度制限: 0.05秒以上の変化がある場合のみ実行（シーク操作以外）
    // タイムラインの赤い棒をスムーズに動かすため、閾値を下げる
    const now = Date.now();
    const timeDiff = Math.abs(time - lastSetCurrentTimeValueRef.current);
    const hasSignificantChange = timeDiff > 0.05; // 0.2秒 → 0.05秒に緩和
    const isSyncTick = source.startsWith('RAF');

    if (hasSignificantChange || source === 'updateTimeHandler' || isSyncTick) {
      // console.log(`[INFO] safeSetCurrentTime from ${source}: ${time}秒を設定`);
      lastSetCurrentTimeValueRef.current = time;
      lastSetCurrentTimeTimestampRef.current = now;
      setCurrentTime(time);
    } else {
      // console.debug(
      //   `[DEBUG] safeSetCurrentTime from ${source}: 更新をスキップ (変化=${timeDiff.toFixed(
      //     3,
      //   )}秒)`,
      // );
    }
  };

  useEffect(() => {
    // videoTimeがNaNになった場合のみ修正
    if (isNaN(videoTime)) {
      console.warn('videoTimeがNaNになっています。0にリセットします。');
      setVideoTime(0);
    }
    // 異常値の警告のみ(リセットしない)
    const maxAllowedTime = maxSec > 0 ? maxSec + 10 : 7200;
    if (videoTime > maxAllowedTime) {
      console.warn(
        `[WARNING] videoTimeが異常に高い値 (${videoTime}秒、上限=${maxAllowedTime}秒) です。`,
      );
      // リセット処理は削除 - ユーザーの操作を尊重
    }
  }, [videoTime, maxSec]);

  // propsとして渡される値の異常チェック
  useEffect(() => {
    if (maxSec > 7200) {
      // 2時間を超える場合
      console.error(
        `[ERROR] VideoController: 異常に高いmaxSec (${maxSec}秒) が設定されています。`,
      );
    }
  }, [maxSec]);

  // シークイベントのリスニング（RAF処理の一時停止/再開）
  useEffect(() => {
    const handleSeekStart = () => {
      console.log('[VideoController] Seek started, pausing RAF');
      isSeekingRef.current = true;
    };

    const handleSeekEnd = () => {
      console.log('[VideoController] Seek ended, resuming RAF');
      isSeekingRef.current = false;
    };

    window.addEventListener('video-seek-start', handleSeekStart);
    window.addEventListener('video-seek-end', handleSeekEnd);

    return () => {
      window.removeEventListener('video-seek-start', handleSeekStart);
      window.removeEventListener('video-seek-end', handleSeekEnd);
    };
  }, []);

  // タイムラインクリック等の外部シーク操作を検知
  const prevCurrentTimeRef = useRef<number>(currentTime);
  useEffect(() => {
    // currentTimeが外部から変更された場合(タイムラインクリック等)
    if (currentTime !== prevCurrentTimeRef.current) {
      console.log(
        `[INFO] 外部シーク検知: ${prevCurrentTimeRef.current}秒 → ${currentTime}秒`,
      );
      lastManualSeekTimestamp.current = Date.now();
      prevCurrentTimeRef.current = currentTime;
    }
  }, [currentTime]);

  // 既存のVideo.jsプレイヤー取得（新規作成はしない）
  type VjsPlayer = {
    isDisposed?: () => boolean;
    readyState?: () => number;
    play?: () => Promise<void> | void;
    pause?: () => void;
    on?: (event: string, handler: () => void) => void;
    off?: (event: string, handler: () => void) => void;
    muted?: (val: boolean) => void;
    ready?: (cb: () => void) => void;
    currentTime?: () => number;
    duration?: () => number;
  };
  type VjsNamespace = {
    (el: string): VjsPlayer | undefined;
    getPlayer?: (id: string) => VjsPlayer | undefined;
  };
  const getExistingPlayer = (id: string): VjsPlayer | undefined => {
    try {
      const anyVjs: VjsNamespace = videojs as unknown as VjsNamespace;

      if (typeof anyVjs.getPlayer === 'function') {
        const p = anyVjs.getPlayer?.(id);
        if (p && !p.isDisposed?.()) return p;
      }
      // ここで videojs(id) を呼ぶと新規生成される可能性があるため禁止
      return undefined;
    } catch (e) {
      console.debug('getExistingPlayer error', e);
      return undefined;
    }
  };

  // キーボードショートカットのイベントリスナー（Electron環境でのみ実行）
  useEffect(() => {
    if (window.electronAPI && typeof window.electronAPI.on === 'function') {
      const channel = 'video-shortcut-event';
      const handler = (_event: unknown, args: number) => {
        console.log(`[HOTKEY] ショートカットキー受信: args=${args}`);
        if (args > 0) {
          console.log(`[HOTKEY] 再生速度変更: ${args}倍速`);
          setVideoPlayBackRate(args);
          if (args !== 1) {
            triggerFlash(`speed-${args}`);
          }
          if (args === 1) {
            console.log(`[HOTKEY] 再生/一時停止トグル実行`);
            try {
              // 全プレイヤーのミュート解除を先に試行
              ['video_0', 'video_1'].forEach((id) => {
                try {
                  // anyを使わずにgetPlayerを厳密化
                  type VjsNSLocal = {
                    getPlayer?: (pid: string) => VjsPlayer | undefined;
                  };
                  const vjsLocal = videojs as unknown as VjsNSLocal;
                  const p = vjsLocal.getPlayer?.(id);
                  if (p && !p.isDisposed?.()) {
                    try {
                      p.muted?.(false);
                    } catch (e) {
                      console.debug('unmute via vjs error', e);
                    }
                    const ve = (p as unknown as { el?: () => Element | null })
                      .el?.()
                      ?.querySelector('video') as HTMLVideoElement | null;
                    if (ve) {
                      ve.muted = false;
                    }
                  }
                } catch (e) {
                  console.debug('getPlayer/unmute loop error', e);
                }
              });
            } catch (e) {
              console.debug('unmute-all try block error', e);
            }
            // refから最新の値を取得してトグル
            const currentState = isVideoPlayingRef.current;
            const newState = !currentState;
            console.log(`[HOTKEY] 再生状態変更: ${currentState} → ${newState}`);
            setIsVideoPlaying(newState);
            triggerFlash('toggle-play');
          }
        } else {
          console.log(`[HOTKEY] シーク操作: ${args}秒`);
          // 手動シーク操作のタイムスタンプを記録
          lastManualSeekTimestamp.current = Date.now();

          setCurrentTime((prev) => {
            const newTime = Math.max(0, prev + args); // 負の値を防止
            console.log(`[HOTKEY] 時間変更: ${prev}秒 → ${newTime}秒`);

            // 即座にVideo.jsプレイヤーにもシークを適用
            videoList.forEach((_, index) => {
              try {
                const player = getExistingPlayer(`video_${index}`);
                if (player && !player.isDisposed?.()) {
                  const offset =
                    index > 0 && syncData?.isAnalyzed
                      ? syncData.syncOffset || 0
                      : 0;
                  const targetTime = Math.max(
                    0,
                    newTime - (index > 0 ? offset : 0),
                  );

                  try {
                    (
                      player as unknown as {
                        currentTime?: (t?: number) => number;
                      }
                    ).currentTime?.(targetTime);
                    console.log(
                      `[HOTKEY] Video ${index}をシーク: ${targetTime}秒`,
                    );
                  } catch (e) {
                    console.debug(`[HOTKEY] Video ${index}シークエラー:`, e);
                  }
                }
              } catch (e) {
                console.debug(`[HOTKEY] Video ${index}アクセスエラー:`, e);
              }
            });

            return newTime;
          });
          if (args === -10) {
            triggerFlash('rewind-10');
          } else if (args === -5) {
            triggerFlash('rewind-10');
          }
        }
      };

      // 既存の同一ハンドラを一旦解除してから登録（重複回避）
      try {
        window.electronAPI?.off?.(
          channel,
          handler as unknown as (...args: unknown[]) => void,
        );
      } catch (e) {
        // ignore if not previously registered
        console.debug('keyboard pre-off ignored', e);
      }

      window.electronAPI.on(
        channel,
        handler as unknown as (event: Event, args: number) => void,
      );
      return () => {
        try {
          window.electronAPI?.off?.(
            channel,
            handler as unknown as (...args: unknown[]) => void,
          );
        } catch (e) {
          console.debug('keyboard off error', e);
        }
      };
    } else {
      console.log('ブラウザ環境: Electron APIは利用できません');
    }
  }, []);

  // 映像の再生位置を監視（共通シークバーとの連動）
  useEffect(() => {
    if (videoList.length === 0) return;

    let intervalId: NodeJS.Timeout | undefined;
    let animationFrameId: number | undefined;

    const updateTimeHandler = () => {
      try {
        const primaryPlayer = getExistingPlayer('video_0');
        if (primaryPlayer) {
          let duration = 0;
          try {
            const dur = primaryPlayer.duration
              ? primaryPlayer.duration()
              : undefined;
            duration = typeof dur === 'number' && !isNaN(dur) ? dur : 0;
          } catch {
            duration = 0;
          }

          if (
            typeof duration === 'number' &&
            !isNaN(duration) &&
            duration > 0
          ) {
            let newVideoTime = 0;
            try {
              const rawTime = primaryPlayer.currentTime
                ? primaryPlayer.currentTime() || 0
                : 0;

              // Video.jsから取得した時間値を検証
              if (
                typeof rawTime === 'number' &&
                !isNaN(rawTime) &&
                rawTime >= 0
              ) {
                if (rawTime > duration + 5) {
                  // duration + 5秒を超える場合は警告のみ
                  console.warn(
                    `[WARNING] Video.js currentTime (${rawTime}秒) が duration (${duration}秒) を大幅に超えています。`,
                  );
                  newVideoTime = rawTime; // そのまま使用(リセットしない)
                } else if (rawTime > 7200) {
                  // 2時間を超える場合は警告のみ
                  console.warn(
                    `[WARNING] Video.js currentTime (${rawTime}秒) が異常に高い値です。`,
                  );
                  newVideoTime = rawTime; // そのまま使用(リセットしない)
                } else {
                  newVideoTime = rawTime;
                }
              } else {
                newVideoTime = 0;
              }
            } catch {
              newVideoTime = 0;
            }

            // 手動シーク直後(500ms以内)は上書きしない
            const timeSinceManualSeek =
              Date.now() - lastManualSeekTimestamp.current;
            if (timeSinceManualSeek < 500) {
              console.log(
                `[DEBUG] 手動シーク直後のため updateTimeHandler をスキップ (${timeSinceManualSeek}ms経過)`,
              );
              return;
            }

            // 負のオフセット時、スライダーが負領域を指している間は上書きしない
            const negOffset = !!(
              syncData?.isAnalyzed && (syncData?.syncOffset ?? 0) < 0
            );
            if (negOffset && videoTime < 0) {
              return;
            }

            if (
              typeof newVideoTime === 'number' &&
              !isNaN(newVideoTime) &&
              newVideoTime >= 0
            ) {
              // 閾値を0.1秒に変更して更新頻度を下げる
              if (Math.abs(newVideoTime - videoTime) > 0.1) {
                setVideoTime(newVideoTime);
              }
            }
          }
        }
      } catch (error) {
        console.debug('プレイヤーアクセスエラー:', error);
      }
    };

    const animationUpdateHandler = (ts?: number) => {
      // シーク中はRAF処理をスキップ
      if (isSeekingRef.current) {
        console.log('[VideoController] RAF skipped (seeking)');
        animationFrameId = requestAnimationFrame(animationUpdateHandler);
        return;
      }

      const offset = Number(syncData?.syncOffset || 0);
      const negOffset = !!(syncData?.isAnalyzed && offset < 0);
      const posOffset = !!(syncData?.isAnalyzed && offset > 0);

      // 過剰なログを削減 - 10秒に1回だけログ出力
      const shouldLog =
        !ts ||
        Math.floor(ts / 10000) !==
          Math.floor((rafLastTsRef.current || 0) / 10000);
      if (shouldLog) {
        console.log(
          `[DEBUG] RAF update: offset=${offset}, negOffset=${negOffset}, posOffset=${posOffset}, videoTime=${videoTime}, isVideoPlaying=${isVideoPlaying}`,
        );
      } // RAF時間差分
      if (typeof ts === 'number') {
        if (rafLastTsRef.current == null) rafLastTsRef.current = ts;
        const dt = Math.max(0, (ts - rafLastTsRef.current) / 1000);
        rafLastTsRef.current = ts;

        if (isVideoPlaying && dt > 0 && dt < 1.0) {
          try {
            const p0 = getExistingPlayer('video_0');
            const p1 = getExistingPlayer('video_1');
            const p0t = p0?.currentTime ? p0.currentTime() || 0 : 0;
            const p1t = p1?.currentTime ? p1.currentTime() || 0 : 0;
            let d0 = 0,
              d1 = 0;
            try {
              d0 = p0?.duration ? p0.duration() || 0 : 0;
              d1 = p1?.duration ? p1.duration() || 0 : 0;
            } catch {
              d0 = 0;
              d1 = 0;
            }

            if (shouldLog) {
              console.log(
                `[SYNC] RAF state: p0t=${p0t}, p1t=${p1t}, d0=${d0}, d1=${d1}, dt=${dt}`,
              );
            }

            // 音声同期に基づく時間進行制御
            if (negOffset) {
              // 負のオフセット: video_1が先行する場合
              // video_1が再生中で、まだvideo_0の開始時間に達していない場合
              if (videoTime < Math.abs(offset) && p1t > 0) {
                const next = Math.min(Math.abs(offset), videoTime + dt);
                if (next !== videoTime && next > -600) {
                  setVideoTime(next);
                  safeSetCurrentTime(next, 'RAF-negativeOffset-preStart');
                }
              }
              // 両方の動画が再生可能になった後は通常の時間進行
              else if (videoTime >= Math.abs(offset) && (p0t > 0 || p1t > 0)) {
                const next = videoTime + dt;
                if (next < maxSec && next < 3600) {
                  setVideoTime(next);
                  safeSetCurrentTime(next, 'RAF-negativeOffset-both');
                }
              }
            } else if (posOffset) {
              // 正のオフセット: video_0が先行する場合
              // video_0が再生中で、まだvideo_1の開始時間に達していない場合
              if (videoTime < offset && p0t > 0) {
                const next = Math.min(offset, videoTime + dt);
                if (next !== videoTime) {
                  setVideoTime(next);
                  safeSetCurrentTime(next, 'RAF-positiveOffset-preStart');
                }
              }
              // 両方の動画が再生可能になった後は通常の時間進行
              else if (videoTime >= offset && (p0t > 0 || p1t > 0)) {
                const next = videoTime + dt;
                if (next < maxSec && next < 3600) {
                  setVideoTime(next);
                  safeSetCurrentTime(next, 'RAF-positiveOffset-both');
                }
              }
              // video_0が終了してもvideo_1が継続する場合
              else if (d0 > 0 && p0t >= d0 - 0.01 && p1t > 0) {
                const maxAllowed = Math.max(0, maxSec);
                const next = Math.min(maxAllowed, videoTime + dt);
                if (next !== videoTime && next < 3600) {
                  setVideoTime(next);
                  safeSetCurrentTime(next, 'RAF-positiveOffset-continue');
                }
              }
            } else {
              // オフセットなしの場合：通常の同期再生
              if (p0t > 0 || p1t > 0) {
                const next = videoTime + dt;
                if (next < maxSec && next < 3600) {
                  setVideoTime(next);
                  safeSetCurrentTime(next, 'RAF-noOffset');
                }
              }
            }
          } catch {
            /* noop */
          }
        }
      }

      updateTimeHandler();
      // RAF処理を再有効化（頻度制限付き）
      animationFrameId = requestAnimationFrame(animationUpdateHandler);
    };

    // プレイヤーの準備ができるまで待つ
    const timer = setTimeout(() => {
      try {
        const primaryPlayer = getExistingPlayer('video_0');
        if (primaryPlayer) {
          primaryPlayer.on?.('timeupdate', updateTimeHandler);

          if (isVideoPlaying) {
            rafLastTsRef.current = null;
            // RAF処理を再有効化（頻度制限付き）
            animationFrameId = requestAnimationFrame(animationUpdateHandler);
          }

          intervalId = setInterval(updateTimeHandler, 200);
        }
      } catch (error) {
        console.debug('プレイヤー初期化待機中:', error);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      rafLastTsRef.current = null;
      try {
        const primaryPlayer = getExistingPlayer('video_0');
        if (primaryPlayer) {
          primaryPlayer.off?.('timeupdate', updateTimeHandler);
        }
      } catch (error) {
        console.debug('プレイヤークリーンアップエラー:', error);
      }
    };
  }, [
    videoList,
    isVideoPlaying,
    syncData?.syncOffset,
    syncData?.isAnalyzed,
    videoTime,
    maxSec,
  ]);

  // PLAY ALLを押した直後、全プレイヤーに対して再生前に同期シーク→再生を試行（既存のみ）
  useEffect(() => {
    if (isVideoPlaying && videoList.length > 0) {
      const tryPlayAll = () => {
        // 基準時間: 負のオフセットでスライダーが負のときは videoTime を優先
        const base = getExistingPlayer('video_0');
        const useSlider = !!(
          syncData?.isAnalyzed &&
          (syncData?.syncOffset ?? 0) < 0 &&
          videoTime < 0
        );
        let baseTime = 0;
        try {
          baseTime = useSlider
            ? videoTime
            : base?.currentTime
            ? base.currentTime() || videoTime
            : videoTime;
        } catch {
          baseTime = videoTime;
        }

        // オフセット: syncData があれば使用、なければ p0/p1 の時刻から算出
        let localOffset = 0;
        if (syncData?.isAnalyzed) {
          localOffset = syncData.syncOffset || 0;
        } else if (videoList.length > 1) {
          const p1 = getExistingPlayer('video_1');
          let t1 = 0;
          try {
            t1 = p1?.currentTime ? p1.currentTime() || 0 : 0;
          } catch {
            t1 = 0;
          }
          localOffset = (base?.currentTime ? base.currentTime() || 0 : 0) - t1;
        }

        videoList.forEach((_, index) => {
          try {
            const id = `video_${index}`;
            const player = getExistingPlayer(id);
            if (player && !player.isDisposed?.()) {
              const rs = player.readyState?.() ?? 0;

              // 2本目以降は再生前に同期位置へシーク
              if (index > 0) {
                const targetTime = Math.max(0, baseTime - localOffset);
                try {
                  (
                    player as unknown as {
                      currentTime?: (t?: number) => number;
                    }
                  ).currentTime?.(targetTime);
                } catch {
                  /* noop */
                }
              }

              const playNow = () => {
                const p = player.play?.();
                if (p && typeof (p as Promise<unknown>).catch === 'function') {
                  (p as Promise<unknown>).catch(() => {
                    console.debug('play promise rejected (autoplay policy)');
                  });
                }
              };

              // オフセットが正で、まだ到達していない場合は遅延開始
              const delayMs =
                index > 0 && localOffset > baseTime
                  ? Math.max(0, (localOffset - baseTime) * 1000)
                  : 0;

              if (rs >= 1) {
                if (delayMs > 0) {
                  setTimeout(playNow, delayMs);
                } else {
                  playNow();
                }
              } else {
                // 準備完了イベントでシーク→（必要なら遅延して）再生
                const onReady = () => {
                  if (index > 0) {
                    const targetTime = Math.max(0, baseTime - localOffset);
                    try {
                      (
                        player as unknown as {
                          currentTime?: (t?: number) => number;
                        }
                      ).currentTime?.(targetTime);
                    } catch {
                      /* noop */
                    }
                  }
                  if (delayMs > 0) {
                    setTimeout(playNow, delayMs);
                  } else {
                    playNow();
                  }
                  player.off?.('loadedmetadata', onReady);
                  player.off?.('canplay', onReady);
                };
                player.on?.('loadedmetadata', onReady);
                player.on?.('canplay', onReady);
              }
            }
          } catch {
            /* noop */
          }
        });
      };
      const t = setTimeout(tryPlayAll, 150);
      return () => clearTimeout(t);
    }
  }, [
    isVideoPlaying,
    videoList,
    videoTime,
    syncData?.syncOffset,
    syncData?.isAnalyzed,
  ]);

  const triggerFlash = useCallback(
    (key: string) => {
      if (!key) return;
      setFlashStates((prev) => ({
        ...prev,
        [key]: true,
      }));
      if (flashTimeoutsRef.current[key]) {
        window.clearTimeout(flashTimeoutsRef.current[key]);
      }
      flashTimeoutsRef.current[key] = window.setTimeout(() => {
        setFlashStates((prev) => ({
          ...prev,
          [key]: false,
        }));
        delete flashTimeoutsRef.current[key];
      }, 220);
    },
    [],
  );
  useEffect(() => {
    return () => {
      Object.values(flashTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      flashTimeoutsRef.current = {};
    };
  }, []);

  const handleSpeedChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const value = Number(event.target.value);
      if (!Number.isNaN(value)) {
        setVideoPlayBackRate(value);
        triggerFlash(`speed-${value}`);
      }
    },
    [setVideoPlayBackRate, triggerFlash],
  );

  const handleSeekAdjust = useCallback(
    (deltaSeconds: number) => {
      const minAllowed =
        syncData?.isAnalyzed &&
        typeof syncData.syncOffset === 'number' &&
        syncData.syncOffset < 0
          ? syncData.syncOffset
          : 0;
      const maxAllowed =
        typeof maxSec === 'number' && maxSec > minAllowed
          ? maxSec
          : Number.POSITIVE_INFINITY;
      const base = Number.isFinite(videoTime) ? videoTime : 0;
      const target = base + deltaSeconds;
      const clamped = Math.min(maxAllowed, Math.max(minAllowed, target));
      lastManualSeekTimestamp.current = Date.now();
      setVideoTime(clamped);
      try {
        handleCurrentTime(new Event('video-controller-seek'), clamped);
      } catch {
        handleCurrentTime({} as React.SyntheticEvent, clamped);
      }
    },
    [videoTime, syncData, maxSec, handleCurrentTime],
  );

  const togglePlayback = useCallback(() => {
    setIsVideoPlaying((prev) => !prev);
  }, [setIsVideoPlaying]);

  const controlButtonSx = {
    color: 'white',
    borderRadius: 1.5,
  } as const;

  const renderSpeedPresetButton = (preset: {
    label: string;
    value: number;
    icon: React.ReactNode;
  }) => {
    const key = `speed-${preset.value}`;
    const isActive = Math.abs(videoPlayBackRate - preset.value) < 0.0001;
    const isFlashing = !!flashStates[key];
    const lit = isActive || isFlashing;
    return (
      <Tooltip title={`${preset.label}で再生`}>
        <span>
          <IconButton
            onClick={() => {
              setVideoPlayBackRate(preset.value);
              triggerFlash(key);
            }}
            disabled={!hasVideos}
            sx={{
              ...controlButtonSx,
              flexDirection: 'column',
              bgcolor: lit ? 'primary.main' : 'rgba(255,255,255,0.12)',
              '&:hover': {
                bgcolor: lit
                  ? 'primary.dark'
                  : 'rgba(255,255,255,0.24)',
              },
              color: 'white',
            }}
            size="large"
          >
            {preset.icon}
            <Typography
              variant="caption"
              sx={{ lineHeight: 1, color: 'inherit', fontWeight: 'bold' }}
            >
              {preset.label}
            </Typography>
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  const renderIconButton = (
    title: string,
    actionKey: string,
    onClick: () => void,
    icon: React.ReactNode,
    options?: { emphasize?: boolean; active?: boolean },
  ) => {
    const emphasize = !!options?.emphasize;
    const isFlashing = !!flashStates[actionKey];
    const isActive = !!options?.active || isFlashing;
    const baseBg = emphasize ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)';
    const hoverBg = emphasize ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.24)';
    const activeBg = emphasize ? 'primary.main' : 'rgba(255,255,255,0.32)';
    const activeHoverBg = emphasize ? 'primary.dark' : 'rgba(255,255,255,0.4)';

    return (
      <Tooltip title={title}>
        <span>
          <IconButton
            onClick={() => {
              onClick();
              triggerFlash(actionKey);
            }}
            disabled={!hasVideos}
            sx={{
              ...controlButtonSx,
              bgcolor: isActive ? activeBg : baseBg,
              '&:hover': {
                bgcolor: isActive ? activeHoverBg : hoverBg,
              },
              boxShadow: isFlashing
                ? '0 0 0 2px rgba(255,255,255,0.4)'
                : undefined,
            }}
            size="large"
          >
            {icon}
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  // UI: コントロールバー（アイコン操作 + 速度セレクト）
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        pointerEvents: 'auto',
        p: { xs: 1.25, md: 1.5 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: { xs: 1, md: 1.5 },
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          {renderIconButton(
            '30秒戻る',
            'rewind-30',
            () => handleSeekAdjust(-LARGE_SKIP_SECONDS),
            <Replay30Icon />,
          )}
          {renderIconButton(
            '10秒戻る',
            'rewind-10',
            () => handleSeekAdjust(-SMALL_SKIP_SECONDS),
            <Replay10Icon />,
          )}
          {renderIconButton(
            isVideoPlaying ? '一時停止' : '再生',
            'toggle-play',
            togglePlayback,
            isVideoPlaying ? <PauseIcon /> : <PlayArrowIcon />,
            { emphasize: true, active: isVideoPlaying },
          )}
          {renderIconButton(
            '10秒進む',
            'forward-10',
            () => handleSeekAdjust(SMALL_SKIP_SECONDS),
            <Forward10Icon />,
          )}
          {renderIconButton(
            '30秒進む',
            'forward-30',
            () => handleSeekAdjust(LARGE_SKIP_SECONDS),
            <Forward30Icon />,
          )}
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: 'rgba(255,255,255,0.16)',
            display: { xs: 'none', md: 'block' },
          }}
        />

        <Stack direction="row" spacing={0.5} alignItems="center">
          {speedPresets.map((preset) => (
            <Box key={preset.label}>{renderSpeedPresetButton(preset)}</Box>
          ))}
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: 'rgba(255,255,255,0.16)',
            display: { xs: 'none', md: 'block' },
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <FormControl
            size="small"
            variant="outlined"
            sx={{
              minWidth: 120,
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiInputLabel-shrink': { color: 'primary.light' },
              '& .MuiOutlinedInput-input': { color: 'white' },
              '& .MuiSvgIcon-root': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.6)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.light',
              },
            }}
          >
            <InputLabel id="playback-speed-label">Speed</InputLabel>
            <Select
              labelId="playback-speed-label"
              label="Speed"
              value={String(videoPlayBackRate)}
              onChange={handleSpeedChange}
              sx={{
                '& .MuiSelect-icon': { color: 'white' },
              }}
            >
              {speedOptions.map((speed) => (
                <MenuItem key={speed} value={speed.toString()}>
                  {speed}x
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ShortcutGuide />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Typography
          variant="body2"
          sx={{
            textAlign: { xs: 'left', md: 'right' },
            color: 'white',
            fontWeight: 'bold',
            minWidth: { xs: 'auto', md: 140 },
            lineHeight: 1.2,
          }}
        >
          {formatTime(videoTime)} / {formatTime(maxSec)}
        </Typography>
      </Box>
    </Box>
  );

};
