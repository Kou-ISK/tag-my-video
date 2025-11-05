import { useCallback, useEffect, useState } from 'react';

const DEFAULT_ASPECT_RATIO = 16 / 9;

export const useVideoAspectRatios = (videoList: string[]) => {
  const [aspectRatios, setAspectRatios] = useState<number[]>([]);

  useEffect(() => {
    setAspectRatios((prev) => {
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
  }, [videoList]);

  const handleAspectRatioChange = useCallback((index: number, ratio: number) => {
    if (!Number.isFinite(ratio) || ratio <= 0) {
      return;
    }
    setAspectRatios((prev) => {
      const next = [...prev];
      if (Math.abs((next[index] ?? 0) - ratio) < 0.0001) {
        return prev;
      }
      next[index] = ratio;
      return next;
    });
  }, []);

  return { aspectRatios, handleAspectRatioChange };
};
