import { findTrackingAnchor } from './trackingAnchor';
import {
  annotationAtTime,
  annotationOffsetAt,
} from '../../../../shared/tactics/annotationMotion';
import { simplifyMotion } from '../../../../shared/tactics/simplifyMotion';
import type {
  DrawingKeyframe,
  DrawingObject,
} from '../../../../types/playlist/core';
import { getObjectBounds } from '../../components/annotationCanvasUtils';
import { matchTemplate } from './templateTracker';
import { openVideoFrameReader } from './videoFrameReader';
export interface TrackingResult {
  object: DrawingObject;
  lost: boolean;
  confidence: number;
  trackedDuration: number;
}
export const trackAnnotation = async (
  source: string,
  object: DrawingObject,
  endTime: number,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
  fromTime = object.timestamp,
): Promise<TrackingResult> => {
  const start = Math.max(object.timestamp, fromTime);
  const startingOffset = annotationOffsetAt(object, start);
  const localStart = start - object.timestamp;
  const bounds = getObjectBounds(annotationAtTime(object, start));
  if (!bounds) throw new Error('追跡する描画を選択してください。');
  const reader = await openVideoFrameReader(source, signal);
  try {
    const scaleX = reader.width / (object.baseWidth ?? reader.width);
    const scaleY = reader.height / (object.baseHeight ?? reader.height);
    const center = {
      x: Math.round(((bounds.minX + bounds.maxX) / 2) * scaleX),
      y: Math.round(((bounds.minY + bounds.maxY) / 2) * scaleY),
    };
    let frame = await reader.read(start);
    const origin = findTrackingAnchor(
      frame,
      center,
      Math.max(8, ((bounds.maxX - bounds.minX) * scaleX) / 2),
      ['disc', 'ring', 'beam'].includes(object.type),
    );
    let at = origin;
    const duration = Math.min(
      20,
      endTime - start,
      object.timestamp + 600 - start,
    );
    const keys: DrawingKeyframe[] = [{ time: localStart, ...startingOffset }];
    let lost = false;
    let confidence = 1;
    const steps = Math.ceil(duration * 10);
    for (let step = 1; step <= steps; step++) {
      const time = Math.min(duration, step / 10);
      const next = await reader.read(start + time);
      const match = matchTemplate(frame, at, next);
      confidence = Math.min(confidence, match.confidence);
      if (!match.reliable) {
        lost = true;
        break;
      }
      keys.push({
        time: localStart + time,
        x: startingOffset.x + (match.x - origin.x) / scaleX,
        y: startingOffset.y + (match.y - origin.y) / scaleY,
      });
      at = match;
      frame = next;
      onProgress(step / steps);
      // キャンセルと描画のためイベントループへ制御を返す。
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      if (signal.aborted) throw new DOMException('中止しました', 'AbortError');
    }
    if (keys.length < 2)
      throw new Error(
        '対象を識別できませんでした。図形の中央を選手の模様や輪郭へ合わせて再試行してください。',
      );
    const prefix =
      object.motion?.keyframes.filter((key) => key.time < localStart) ?? [];
    const combined = [...prefix, ...simplifyMotion(keys)].slice(0, 256);
    if (combined[0]?.time !== 0) combined.unshift({ time: 0, x: 0, y: 0 });
    const finalKeys = combined.slice(0, 256);
    return {
      trackedDuration: Math.max(
        0,
        finalKeys[finalKeys.length - 1].time - localStart,
      ),
      object: {
        ...object,
        motion: {
          duration: finalKeys[finalKeys.length - 1].time,
          keyframes: finalKeys,
        },
      },
      lost:
        lost ||
        finalKeys[finalKeys.length - 1].time < keys[keys.length - 1].time,
      confidence,
    };
  } finally {
    reader.dispose();
  }
};
