import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import videojs from 'video.js';
import type { VideoSyncData } from '../../../../../../types/VideoSync';

interface UseSyncPlaybackParams {
  videoList: string[];
  syncData?: VideoSyncData;
  isVideoPlaying: boolean;
  forceUpdateKey: number;
}

interface UseSyncPlaybackReturn {
  primaryClock: number;
  adjustedCurrentTimes: number[];
  blockPlayStates: boolean[];
  isSeekingRef: React.MutableRefObject<boolean>;
  setPrimaryClock: (time: number) => void;
  lastReportedTimeRef: React.MutableRefObject<number>;
}

const epsilon = 0.05;

const ensurePlayer = (id: string) => {
  const namespace = videojs as unknown as {
    getPlayer?: (pid: string) => {
      currentTime?: () => number;
      on?: (event: string, handler: () => void) => void;
      off?: (event: string, handler: () => void) => void;
    } | undefined;
  };
  return namespace.getPlayer?.(id);
};

export const useSyncPlayback = ({
  videoList,
  syncData,
  isVideoPlaying,
  forceUpdateKey,
}: UseSyncPlaybackParams): UseSyncPlaybackReturn => {
  const [primaryClock, setPrimaryClock] = useState(0);
  const lastReportedTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const offset = syncData?.syncOffset ?? 0;
  const analyzed = syncData?.isAnalyzed ?? false;

  useEffect(() => {
    if (forceUpdateKey <= 0) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 30;

    const updatePrimaryClock = () => {
      try {
        const player = ensurePlayer('video_0');
        const current = player?.currentTime?.();
        if (typeof current === 'number' && !Number.isNaN(current)) {
          setPrimaryClock(current);
          lastReportedTimeRef.current = current;
          return true;
        }
      } catch {
        /* noop */
      }
      return false;
    };

    const timer = setInterval(() => {
      attempts++;
      if (updatePrimaryClock() || attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, pollInterval);

    if (updatePrimaryClock()) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [forceUpdateKey]);

  useEffect(() => {
    const handleSeekStart = () => {
      isSeekingRef.current = true;
    };
    const handleSeekEnd = () => {
      isSeekingRef.current = false;
    };

    window.addEventListener('video-seek-start', handleSeekStart);
    window.addEventListener('video-seek-end', handleSeekEnd);

    return () => {
      window.removeEventListener('video-seek-start', handleSeekStart);
      window.removeEventListener('video-seek-end', handleSeekEnd);
    };
  }, []);

  useEffect(() => {
    const player = ensurePlayer('video_0');
    if (!player || !isVideoPlaying) {
      return;
    }

    if (lastReportedTimeRef.current === 0) {
      lastReportedTimeRef.current = primaryClock;
    }

    const reportThreshold = 0.08;
    const handleTimeUpdate = () => {
      if (isSeekingRef.current) {
        return;
      }
      try {
        const current = player.currentTime?.();
        if (
          typeof current === 'number' &&
          !Number.isNaN(current) &&
          Math.abs(current - lastReportedTimeRef.current) >= reportThreshold
        ) {
          setPrimaryClock(current);
          lastReportedTimeRef.current = current;
        }
      } catch {
        /* noop */
      }
    };

    player.on?.('timeupdate', handleTimeUpdate);
    return () => {
      player.off?.('timeupdate', handleTimeUpdate);
    };
  }, [isVideoPlaying, primaryClock, videoList.join('|')]);

  const adjustedCurrentTimes = useMemo(() => {
    return videoList.map((_, index) => {
      if (index === 0) {
        return Math.max(0, primaryClock);
      }
      const shifted = primaryClock - offset;
      if (offset < 0) {
        return Math.max(0, shifted);
      }
      return shifted < 0 ? 0 : shifted;
    });
  }, [videoList, primaryClock, offset]);

  const blockPlayStates = useMemo(() => {
    return videoList.map((_, index) => {
      if (!analyzed) {
        return false;
      }
      if (offset < -epsilon) {
        if (index === 0) {
          return primaryClock < Math.abs(offset) - epsilon;
        }
        return false;
      }

      if (offset > epsilon) {
        if (index === 0) {
          return false;
        }
        return primaryClock < offset - epsilon;
      }

      return false;
    });
  }, [videoList, analyzed, offset, primaryClock]);

  return {
    primaryClock,
    adjustedCurrentTimes,
    blockPlayStates,
    isSeekingRef,
    setPrimaryClock,
    lastReportedTimeRef,
  };
};
