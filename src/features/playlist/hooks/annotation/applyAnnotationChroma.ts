import { maskAnnotationPixels } from '../../../../shared/tactics/chromaKey';
import type { ChromaKey } from '../../../../shared/tactics/chromaKey';
export const applyAnnotationChroma = (
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  key: ChromaKey,
  rect: { offsetX: number; offsetY: number; width: number; height: number },
  scratch: HTMLCanvasElement,
): void => {
  scratch.width = context.canvas.width;
  scratch.height = context.canvas.height;
  const source = scratch.getContext('2d', { willReadFrequently: true });
  if (!source || !video.videoWidth) return;
  source.drawImage(video, rect.offsetX, rect.offsetY, rect.width, rect.height);
  const image = context.getImageData(0, 0, scratch.width, scratch.height);
  maskAnnotationPixels(
    image.data,
    source.getImageData(0, 0, scratch.width, scratch.height).data,
    key,
  );
  context.putImageData(image, 0, 0);
};
