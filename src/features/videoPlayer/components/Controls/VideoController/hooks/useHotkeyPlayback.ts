import { useEffect, useRef } from 'react';
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

        const videoElement = (
          player as unknown as { el?: () => Element | null }
        )
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
  // 最新の値をuseRefで保持し、依存配列から除外してリスナー累積を防ぐ
  const setVideoPlayBackRateRef = useRef(setVideoPlayBackRate);
  const triggerFlashRef = useRef(triggerFlash);
  const setIsVideoPlayingRef = useRef(setIsVideoPlaying);
  const setCurrentTimeRef = useRef(setCurrentTime);
  const videoListRef = useRef(videoList);
  const syncDataRef = useRef(syncData);
  const getExistingPlayerRef = useRef(getExistingPlayer);

  // useEffectの外で常に最新の値を保持（空の依存配列により初回のみ実行）
  useEffect(() => {
    setVideoPlayBackRateRef.current = setVideoPlayBackRate;
    triggerFlashRef.current = triggerFlash;
    setIsVideoPlayingRef.current = setIsVideoPlaying;
    setCurrentTimeRef.current = setCurrentTime;
    videoListRef.current = videoList;
    syncDataRef.current = syncData;
    getExistingPlayerRef.current = getExistingPlayer;
  }, [
    setVideoPlayBackRate,
    triggerFlash,
    setIsVideoPlaying,
    setCurrentTime,
    videoList,
    syncData,
    getExistingPlayer,
  ]);

  useEffect(() => {
    const api = globalThis.window.electronAPI;
    if (!api || typeof api.on !== 'function') {
      console.log('ブラウザ環境: Electron APIは利用できません');
      return;
    }

    const channel = 'video-shortcut-event';
    const handler = (_event: unknown, args: number) => {
      console.log(`[HOTKEY] ショートカットキー受信: args=${args}`);
      if (args > 0) {
        setVideoPlayBackRateRef.current(args);
        if (args !== 1) {
          triggerFlashRef.current(`speed-${args}`);
        }
        if (args === 1) {
          unmuteExistingPlayers();
          const currentState = isVideoPlayingRef.current;
          const nextState = !currentState;
          console.log(`[HOTKEY] 再生状態変更: ${currentState} → ${nextState}`);
          setIsVideoPlayingRef.current(nextState);
          triggerFlashRef.current('toggle-play');
        }
        return;
      }

      console.log(`[HOTKEY] シーク操作: ${args}秒`);
      lastManualSeekTimestamp.current = Date.now();

      setCurrentTimeRef.current((prev) => {
        const nextTime = Math.max(0, prev + args);
        const currentVideoList = videoListRef.current;
        const currentSyncData = syncDataRef.current;
        const currentGetPlayer = getExistingPlayerRef.current;

        for (let index = 0; index < currentVideoList.length; index++) {
          try {
            const player = currentGetPlayer(`video_${index}`);
            if (player && !player.isDisposed?.()) {
              const offset =
                index > 0 && currentSyncData?.isAnalyzed
                  ? currentSyncData.syncOffset || 0
                  : 0;
              const targetTime = Math.max(
                0,
                nextTime - (index > 0 ? offset : 0),
              );

              try {
                player.currentTime?.(targetTime);
              } catch (error) {
                console.debug(`[HOTKEY] Video ${index}シークエラー:`, error);
              }
            }
          } catch (error) {
            console.debug(`[HOTKEY] Video ${index}アクセスエラー:`, error);
          }
        }
        return nextTime;
      });

      if (args === -10 || args === -5) {
        triggerFlashRef.current('rewind-10');
      }
    };

    try {
      api.off?.(channel, handler as unknown as (...args: unknown[]) => void);
    } catch (error) {
      console.debug('keyboard pre-off ignored', error);
    }

    api.on(
      channel,
      handler as unknown as (event: unknown, args: unknown) => void,
    );
    console.log('[HOTKEY] video-shortcut-event リスナー登録完了');

    return () => {
      try {
        api.off?.(channel, handler as unknown as (...args: unknown[]) => void);
        console.log('[HOTKEY] video-shortcut-event リスナー解除完了');
      } catch (error) {
        console.debug('keyboard off error', error);
      }
    };
  }, [isVideoPlayingRef, lastManualSeekTimestamp]); // 依存配列を最小限に絞る
};
