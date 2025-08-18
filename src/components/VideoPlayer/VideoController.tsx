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
  handleCurrentTime,
  maxSec,
  videoList,
  syncData,
}: VideoControllerProps) => {
  const [videoTime, setVideoTime] = useState<number>(0);
  const rafLastTsRef = useRef<number | null>(null);

  useEffect(() => {
    // videoTimeがNaNになった場合の修正
    if (isNaN(videoTime)) {
      console.warn('videoTimeがNaNになっています。0にリセットします。');
      setVideoTime(0);
    }
  }, [videoTime]);

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
        if (args > 0) {
          setVideoPlayBackRate(args);
          if (args === 1) {
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
            setIsVideoPlaying((prev) => !prev);
          }
        } else {
          setCurrentTime((prev) => prev + args);
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
              newVideoTime = primaryPlayer.currentTime
                ? primaryPlayer.currentTime() || 0
                : 0;
            } catch {
              newVideoTime = 0;
            }

            // 負のオフセット時、スライダーが負領域を指している間は上書きしない
            const negOffset = !!(
              syncData?.isAnalyzed && (syncData?.syncOffset ?? 0) < 0
            );
            if (negOffset && videoTime < 0) {
              // グローバル時間は別経路（RAF）で進める
              return;
            }

            if (
              typeof newVideoTime === 'number' &&
              !isNaN(newVideoTime) &&
              newVideoTime >= 0
            ) {
              if (Math.abs(newVideoTime - videoTime) > 0.05) {
                setVideoTime(newVideoTime);
                if (isVideoPlaying) {
                  setCurrentTime(newVideoTime);
                }
              }
            }
          }
        }
      } catch (error) {
        console.debug('プレイヤーアクセスエラー:', error);
      }
    };

    const animationUpdateHandler = (ts?: number) => {
      // 負のオフセット時、基準映像が0秒に留まっている間はRAFでグローバル時間を進める
      const negOffset = !!(
        syncData?.isAnalyzed && (syncData?.syncOffset ?? 0) < 0
      );
      if (isVideoPlaying && negOffset) {
        try {
          const primary = getExistingPlayer('video_0');
          const p0 = primary?.currentTime ? primary.currentTime() || 0 : 0;
          if (videoTime < 0 && p0 <= 0.01) {
            if (typeof ts === 'number') {
              if (rafLastTsRef.current == null) rafLastTsRef.current = ts;
              const dt = (ts - rafLastTsRef.current) / 1000;
              rafLastTsRef.current = ts;
              if (dt > 0 && dt < 1) {
                const next = Math.min(0, videoTime + dt);
                if (Math.abs(next - videoTime) > 1e-3) {
                  setVideoTime(next);
                  setCurrentTime(next);
                }
              }
            }
          }
        } catch {
          /* noop */
        }
      }

      updateTimeHandler();
      animationFrameId = requestAnimationFrame(animationUpdateHandler);
    };

    // プレイヤーの準備ができるまで待つ
    const timer = setTimeout(() => {
      try {
        const primaryPlayer = getExistingPlayer('video_0');
        if (primaryPlayer) {
          // timeupdate イベントでリアルタイム更新
          primaryPlayer.on?.('timeupdate', updateTimeHandler);

          // アニメーションフレームベースでスムーズ更新（再生中のみ）
          if (isVideoPlaying) {
            rafLastTsRef.current = null;
            animationFrameId = requestAnimationFrame(animationUpdateHandler);
          }

          // ポーリングによるバックアップ
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
            setVideoTime(v as number);
            handleCurrentTime(e as unknown as Event, v);
          }}
          valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  );
};
