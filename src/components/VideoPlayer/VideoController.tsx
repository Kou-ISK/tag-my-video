import { Box, Button, Slider, Typography } from '@mui/material';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import videojs from 'video.js';
import { VideoSyncData } from '../../types/VideoSync';

interface VideoControllerProps {
  setIsVideoPlaying: Dispatch<SetStateAction<boolean>>;
  isVideoPlaying: boolean;
  setVideoPlayBackRate: Dispatch<SetStateAction<number>>;
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

    // 頻度制限: 0.2秒以上の変化がある場合のみ実行（シーク操作以外）
    const now = Date.now();
    const timeDiff = Math.abs(time - lastSetCurrentTimeValueRef.current);
    const timeSinceLastCall = now - lastSetCurrentTimeTimestampRef.current;
    const hasSignificantChange = timeDiff > 0.2;

    if (hasSignificantChange || source === 'updateTimeHandler') {
      console.log(`[INFO] safeSetCurrentTime from ${source}: ${time}秒を設定`);
      lastSetCurrentTimeValueRef.current = time;
      lastSetCurrentTimeTimestampRef.current = now;
      setCurrentTime(time);
    } else {
      console.debug(
        `[DEBUG] safeSetCurrentTime from ${source}: 更新をスキップ (変化=${timeDiff.toFixed(
          3,
        )}秒, 経過時間=${timeSinceLastCall}ms)`,
      );
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

  // UI: コントロールバー（最小構成: 再生/一時停止・速度・共通シークバー）
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        p: 1,
        width: '100%',
      }}
    >
      {/* 左: 再生/一時停止、速度 */}
      <Box
        sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}
      >
        <Button
          variant="contained"
          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
          sx={{ minWidth: 100 }}
        >
          {isVideoPlaying ? 'PAUSE' : 'PLAY ALL'}
        </Button>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          Speed
        </Typography>
        <Slider
          size="small"
          min={0.25}
          max={2}
          step={0.25}
          valueLabelDisplay="auto"
          onChange={(_, v) => setVideoPlayBackRate(v as number)}
          sx={{ width: 120 }}
        />
      </Box>

      {/* 中央: 共通シークバー（負のオフセットに対応） */}
      <Box sx={{ flex: 1, px: 2, minWidth: 0 }}>
        <Slider
          size="small"
          min={
            syncData?.isAnalyzed && (syncData?.syncOffset ?? 0) < 0
              ? (syncData?.syncOffset as number)
              : 0
          }
          max={Math.max(0, maxSec)}
          step={0.01}
          value={videoTime}
          onChange={(e, v) => {
            // 手動シーク操作のタイムスタンプを記録
            lastManualSeekTimestamp.current = Date.now();
            setVideoTime(v as number);
            handleCurrentTime(e as unknown as Event, v);
          }}
          valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  );
};
