import type { GrayFrame } from './templateTracker';
export interface VideoFrameReader {
  read: (time: number) => Promise<GrayFrame>;
  width: number;
  height: number;
  dispose: () => void;
}
const waitFor = (
  video: HTMLVideoElement,
  event: string,
  signal: AbortSignal,
  action: () => void,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const cleanup = (): void => {
      clearTimeout(timer);
      video.removeEventListener(event, success);
      video.removeEventListener('error', error);
      signal.removeEventListener('abort', abort);
    };
    const success = (): void => {
      cleanup();
      resolve();
    };
    const error = (): void => {
      cleanup();
      reject(new Error('映像フレームを読み込めませんでした。'));
    };
    const abort = (): void => {
      cleanup();
      reject(new DOMException('中止しました', 'AbortError'));
    };
    const timer = setTimeout(error, 15000);
    video.addEventListener(event, success, { once: true });
    video.addEventListener('error', error, { once: true });
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    try {
      action();
    } catch (cause) {
      cleanup();
      reject(cause);
    }
  });
/** 再生中の要素をシークしない、解析専用のデコーダー。 */
export const openVideoFrameReader = async (
  source: string,
  signal: AbortSignal,
): Promise<VideoFrameReader> => {
  const video = document.createElement('video');
  video.muted = true;
  video.preload = 'auto';
  video.playsInline = true;
  const dispose = (): void => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  };
  try {
    await waitFor(video, 'loadeddata', signal, () => {
      video.src = source;
      video.load();
    });
  } catch (error) {
    dispose();
    throw error;
  }
  const width = Math.min(1280, video.videoWidth);
  const height = Math.round((width * video.videoHeight) / video.videoWidth);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || !width || !height) {
    dispose();
    throw new Error('解析用キャンバスを作成できません。');
  }
  return {
    width,
    height,
    dispose,
    read: async (time) => {
      if (signal.aborted) throw new DOMException('中止しました', 'AbortError');
      if (Math.abs(video.currentTime - time) > 0.0001)
        await waitFor(video, 'seeked', signal, () => {
          video.currentTime = time;
        });
      context.drawImage(video, 0, 0, width, height);
      const rgba = context.getImageData(0, 0, width, height).data;
      const pixels = new Uint8Array(width * height);
      for (let i = 0; i < pixels.length; i++)
        pixels[i] = Math.round(
          rgba[i * 4] * 0.299 +
            rgba[i * 4 + 1] * 0.587 +
            rgba[i * 4 + 2] * 0.114,
        );
      return { width, height, pixels };
    },
  };
};
