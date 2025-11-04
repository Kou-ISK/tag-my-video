import { useEffect } from 'react';
import videojs from 'video.js';
import { VideoSyncData } from '../../../../../../types/VideoSync';

type VjsPlayer = {
  isDisposed?: () => boolean;
  currentTime?: (time?: number) => number;
  muted?: (val: boolean) => void;
};

type GetPlayerFn = (id: string) => VjsPlayer | undefined;

interface UseHotkeyPlaybackOptions {
  setVideoPlayBackRate: (value: number) => void;
  triggerFlash: (key: string) => void;
  setIsVideoPlaying: (value: boolean) => void;
  isVideoPlayingRef: React.MutableRefObject<boolean>;
  setCurrentTime: (updater: (prev: number) => number) => void;
  videoList: string[];
  syncData?: VideoSyncData;
  lastManualSeekTimestamp: React.MutableRefObject<number>;
  getExistingPlayer: GetPlayerFn;
}

const unmuteExistingPlayers = () => {
  try {
    type VjsNamespace = {
      getPlayer?: (id: string) => VjsPlayer | undefined;
    };
    const namespace = videojs as unknown as VjsNamespace;
    ['video_0', 'video_1'].forEach((playerId) => {
      const player = namespace.getPlayer?.(playerId);
      if (player && !player.isDisposed?.()) {
        try {
          player.muted?.(false);
        } catch (error) {
          console.debug('unmute via vjs error', error);
        }

        const videoElement = (player as unknown as { el?: () => Element | null })
          .el?.()
          ?.querySelector('video') as HTMLVideoElement | null;
        if (videoElement) {
          videoElement.muted = false;
        }
      }
    });
  } catch (error) {
    console.debug('unmute-all try block error', error);
  }
};

export const useHotkeyPlayback = ({
  setVideoPlayBackRate,
  triggerFlash,
  setIsVideoPlaying,
  isVideoPlayingRef,
  setCurrentTime,
  videoList,
  syncData,
  lastManualSeekTimestamp,
  getExistingPlayer,
}: UseHotkeyPlaybackOptions) => {
  useEffect(() => {
    const api = window.electronAPI;
    if (!api || typeof api.on !== 'function') {
      console.log('ブラウザ環境: Electron APIは利用できません');
      return;
    }

    const channel = 'video-shortcut-event';
    const handler = (_event: unknown, args: number) => {
      console.log(`[HOTKEY] ショートカットキー受信: args=${args}`);
      if (args > 0) {
        setVideoPlayBackRate(args);
        if (args !== 1) {
          triggerFlash(`speed-${args}`);
        }
        if (args === 1) {
          unmuteExistingPlayers();
          const currentState = isVideoPlayingRef.current;
          const nextState = !currentState;
          console.log(`[HOTKEY] 再生状態変更: ${currentState} → ${nextState}`);
          setIsVideoPlaying(nextState);
          triggerFlash('toggle-play');
        }
        return;
      }

      console.log(`[HOTKEY] シーク操作: ${args}秒`);
      lastManualSeekTimestamp.current = Date.now();

      setCurrentTime((prev) => {
        const nextTime = Math.max(0, prev + args);
        videoList.forEach((_, index) => {
          try {
            const player = getExistingPlayer(`video_${index}`);
            if (player && !player.isDisposed?.()) {
              const offset =
                index > 0 && syncData?.isAnalyzed
                  ? syncData.syncOffset || 0
                  : 0;
              const targetTime = Math.max(0, nextTime - (index > 0 ? offset : 0));

              try {
                player.currentTime?.(targetTime);
              } catch (error) {
                console.debug(`[HOTKEY] Video ${index}シークエラー:`, error);
              }
            }
          } catch (error) {
            console.debug(`[HOTKEY] Video ${index}アクセスエラー:`, error);
          }
        });
        return nextTime;
      });

      if (args === -10 || args === -5) {
        triggerFlash('rewind-10');
      }
    };

    try {
      api.off?.(channel, handler as unknown as (...args: unknown[]) => void);
    } catch (error) {
      console.debug('keyboard pre-off ignored', error);
    }

    api.on(channel, handler as unknown as (event: Event, args: number) => void);
    return () => {
      try {
        api.off?.(channel, handler as unknown as (...args: unknown[]) => void);
      } catch (error) {
        console.debug('keyboard off error', error);
      }
    };
  }, [
    getExistingPlayer,
    isVideoPlayingRef,
    lastManualSeekTimestamp,
    setCurrentTime,
    setIsVideoPlaying,
    setVideoPlayBackRate,
    syncData,
    triggerFlash,
    videoList,
  ]);
};
