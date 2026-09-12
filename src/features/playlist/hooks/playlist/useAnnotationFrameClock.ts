import { useEffect } from 'react';
import type { RefObject } from 'react';
/** 時間更新イベントの頻度に依存せず、動く描画を映像フレームへ合わせる。 */
export const useAnnotationFrameClock = (
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  onTime: (time: number) => void,
): void => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    let id = 0;
    let cancelled = false;
    const update = (): void => {
      if (cancelled) return;
      onTime(video.currentTime);
      id = video.requestVideoFrameCallback(update);
    };
    id = video.requestVideoFrameCallback(update);
    return () => {
      cancelled = true;
      video.cancelVideoFrameCallback(id);
    };
  }, [videoRef, enabled, onTime]);
};
