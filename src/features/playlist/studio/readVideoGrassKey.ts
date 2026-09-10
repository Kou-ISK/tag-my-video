import { extractGrassColor } from '../../../shared/tactics/chromaKey';
import type { ChromaKey } from '../../../shared/tactics/chromaKey';
export const readVideoGrassKey = (
  source: HTMLVideoElement | null,
): ChromaKey => {
  if (!source?.videoWidth)
    throw new Error('映像を読み込んでから抽出してください。');
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = Math.round((320 * source.videoHeight) / source.videoWidth);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('映像の色を取得できません。');
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const color = extractGrassColor(
    context.getImageData(0, 0, canvas.width, canvas.height).data,
  );
  if (!color)
    throw new Error(
      '芝色を識別できません。緑色のピッチが映る場面を選んでください。',
    );
  return { color, similarity: 0.14, blend: 0.04 };
};
