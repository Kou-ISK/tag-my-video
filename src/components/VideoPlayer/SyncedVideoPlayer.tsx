import { Box, Grid } from '@mui/material';
import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import videojs from 'video.js';
import { MemoizedSingleVideoPlayer } from './SingleVideoPlayer';
import { VideoSyncData } from '../../types/VideoSync';

interface SyncedVideoPlayerProps {
  videoList: string[];
  isVideoPlaying: boolean;
  videoPlayBackRate: number;
  setMaxSec: Dispatch<SetStateAction<number>>;
  syncData?: VideoSyncData;
  syncMode?: 'auto' | 'manual';
  forceUpdateKey?: number;
}

export const SyncedVideoPlayer = ({
  videoList,
  isVideoPlaying,
  videoPlayBackRate,
  setMaxSec,
  syncData,
  syncMode = 'auto',
  forceUpdateKey = 0,
}: SyncedVideoPlayerProps) => {
  const offset = syncData?.syncOffset ?? 0;
  const allowSeek = syncMode === 'manual';
  const analyzed = syncData?.isAnalyzed ?? false;
  const releaseRef = useRef<boolean[]>([]);
  const [primaryClock, setPrimaryClock] = useState(0);
  const [videoAspectRatios, setVideoAspectRatios] = useState<number[]>([]);
  const renderCountRef = useRef(0);
  const lastReportedTimeRef = useRef(0); // primaryClock更新を追跡するためのRef
  const isSeekingRef = useRef(false); // シーク中フラグ（timeupdate無視用）
  const DEFAULT_ASPECT_RATIO = 16 / 9;

  // レンダリング回数をカウント
  renderCountRef.current += 1;
  console.log(`[SyncedVideoPlayer] RENDER #${renderCountRef.current}`, {
    isVideoPlaying,
    primaryClock,
    offset,
    forceUpdateKey,
    analyzed,
    isSeeking: isSeekingRef.current,
  });

  const noopSetMax = React.useCallback<Dispatch<SetStateAction<number>>>(
    (value) => {
      void value;
    },
    [],
  );

  useEffect(() => {
    releaseRef.current = [];
  }, [videoList, offset, analyzed]);

  useEffect(() => {
    setVideoAspectRatios((prev) => {
      const next = videoList.map((_, index) => {
        const candidate = prev[index];
        return Number.isFinite(candidate) && candidate > 0
          ? candidate
          : DEFAULT_ASPECT_RATIO;
      });
      if (
        prev.length === next.length &&
        next.every((value, index) => value === prev[index])
      ) {
        return prev;
      }
      return next;
    });
  }, [videoList, DEFAULT_ASPECT_RATIO]);

  const handleAspectRatioChange = useCallback(
    (index: number, ratio: number) => {
      if (!Number.isFinite(ratio) || ratio <= 0) {
        return;
      }
      setVideoAspectRatios((prev) => {
        const next = [...prev];
        if (Math.abs((next[index] ?? 0) - ratio) < 0.0001) {
          return prev;
        }
        next[index] = ratio;
        return next;
      });
    },
    [],
  );

  // forceUpdateKeyが変更されたら、primaryClockを即座に更新
  // Video.jsのcurrentTime()は非同期的に更新されるため、ポーリングで待機
  useEffect(() => {
    if (forceUpdateKey > 0) {
      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 30; // ms

      const updatePrimaryClock = () => {
        try {
          const player = (
            videojs as unknown as {
              getPlayer?: (
                id: string,
              ) => { currentTime?: () => number } | undefined;
            }
          ).getPlayer?.('video_0');
          const t = player?.currentTime?.();
          if (typeof t === 'number' && !Number.isNaN(t)) {
            console.log(
              `[SyncedVideoPlayer] forceUpdateKey=${forceUpdateKey}, primaryClock updated to ${t} (attempt ${
                attempts + 1
              })`,
            );
            setPrimaryClock(t);
            lastReportedTimeRef.current = t; // Refも同時に更新
            return true;
          }
        } catch {
          /* ignore */
        }
        return false;
      };

      const pollTimer = setInterval(() => {
        attempts++;
        if (updatePrimaryClock() || attempts >= maxAttempts) {
          clearInterval(pollTimer);
          if (attempts >= maxAttempts) {
            console.warn(
              '[SyncedVideoPlayer] Failed to update primaryClock after max attempts',
            );
          }
        }
      }, pollInterval);

      // 初回即座に試行
      if (updatePrimaryClock()) {
        clearInterval(pollTimer);
      }

      return () => clearInterval(pollTimer);
    }
  }, [forceUpdateKey]);

  // シークイベントのリスニング（timeupdate処理の一時停止/再開）
  useEffect(() => {
    const handleSeekStart = () => {
      console.log('[SyncedVideoPlayer] Seek started, pausing timeupdate');
      isSeekingRef.current = true;
    };

    const handleSeekEnd = () => {
      console.log('[SyncedVideoPlayer] Seek ended, resuming timeupdate');
      isSeekingRef.current = false;
    };

    window.addEventListener('video-seek-start', handleSeekStart);
    window.addEventListener('video-seek-end', handleSeekEnd);

    return () => {
      window.removeEventListener('video-seek-start', handleSeekStart);
      window.removeEventListener('video-seek-end', handleSeekEnd);
    };
  }, []);

  // timeupdate イベントベースの時刻同期 (RAF不使用でコマ送り回避)
  useEffect(() => {
    const player = (
      videojs as unknown as {
        getPlayer?: (id: string) =>
          | {
              currentTime?: () => number;
              on?: (event: string, handler: () => void) => void;
              off?: (event: string, handler: () => void) => void;
            }
          | undefined;
      }
    ).getPlayer?.('video_0');

    if (!player || !isVideoPlaying) {
      return;
    }

    // 初回のみprimaryClockで初期化、以降はRef経由で更新を追跡
    if (lastReportedTimeRef.current === 0) {
      lastReportedTimeRef.current = primaryClock;
    }

    const reportThreshold = 0.08; // 0.08秒以上変化した場合のみ更新

    const handleTimeUpdate = () => {
      try {
        // シーク中はtimeupdate処理をスキップ
        if (isSeekingRef.current) {
          console.log('[SyncedVideoPlayer] timeupdate skipped (seeking)');
          return;
        }

        const t = player.currentTime?.();
        if (
          typeof t === 'number' &&
          !Number.isNaN(t) &&
          Math.abs(t - lastReportedTimeRef.current) >= reportThreshold
        ) {
          setPrimaryClock(t);
          lastReportedTimeRef.current = t;
        }
      } catch {
        /* ignore */
      }
    };

    player.on?.('timeupdate', handleTimeUpdate);

    return () => {
      player.off?.('timeupdate', handleTimeUpdate);
    };
  }, [isVideoPlaying, videoList.join('|')]); // primaryClockを依存配列から削除

  const adjustedCurrentTimes = useMemo(() => {
    const times = videoList.map((_, index) => {
      if (index === 0) {
        return Math.max(0, primaryClock);
      }
      const shifted = primaryClock - offset;
      if (offset < 0) {
        return Math.max(0, shifted);
      }
      return shifted < 0 ? 0 : shifted;
    });
    console.log('[SyncedVideoPlayer] adjusted times', {
      currentTime: primaryClock,
      offset,
      times,
      videoCount: videoList.length,
    });
    return times;
  }, [videoList, primaryClock, offset]);

  const epsilon = 0.05;
  const blockPlayStates = useMemo(() => {
    const states = videoList.map((_, index) => {
      if (!analyzed) return false;

      if (offset < -epsilon) {
        if (index === 0) {
          return primaryClock < Math.abs(offset) - epsilon;
        }
        return false;
      }

      if (offset > epsilon) {
        if (index === 0) return false;
        return primaryClock < offset - epsilon;
      }

      return false;
    });
    console.log('[SyncedVideoPlayer] block states', {
      currentTime: primaryClock,
      offset,
      states,
    });
    return states;
  }, [videoList, analyzed, offset, primaryClock, epsilon]);

  const activeVideoCount = videoList.filter(
    (filePath) => filePath && filePath.trim() !== '',
  ).length;

  return (
    <Grid
      container
      spacing={0}
      sx={{
        width: '100%',
        margin: 0,
        padding: 0,
        alignItems: 'start',
      }}
    >
      {videoList.map((filePath, index) => {
        console.log('[SyncedVideoPlayer] render entry', {
          index,
          filePath,
          hasSrc: !!filePath,
          block: blockPlayStates[index],
          adjusted: adjustedCurrentTimes[index],
        });
        if (!filePath || filePath.trim() === '') {
          return null;
        }

        const gridColumns = activeVideoCount > 1 ? 6 : 12;
        const aspectRatio = videoAspectRatios[index] ?? DEFAULT_ASPECT_RATIO;
        const paddingTop =
          aspectRatio > 0 ? `${(1 / aspectRatio) * 100}%` : '56.25%';

        return (
          <Grid
            key={`${filePath}-${index}`}
            item
            xs={12}
            md={gridColumns}
            sx={{
              display: 'block',
              padding: 0,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop,
                height: 0,
                minHeight: 0,
                overflow: 'hidden',
                backgroundColor: '#000',
              }}
            >
              <MemoizedSingleVideoPlayer
                videoSrc={filePath}
                id={`video_${index}`}
                isVideoPlaying={isVideoPlaying}
                videoPlayBackRate={videoPlayBackRate}
                setMaxSec={index === 0 ? setMaxSec : noopSetMax}
                blockPlay={blockPlayStates[index] ?? false}
                allowSeek={allowSeek}
                forceUpdate={forceUpdateKey}
                offsetSeconds={index === 0 ? 0 : offset}
                onAspectRatioChange={(ratio) =>
                  handleAspectRatioChange(index, ratio)
                }
              />
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
};
