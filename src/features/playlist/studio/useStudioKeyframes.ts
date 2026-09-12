import { useState } from 'react';
import type { DrawingObject } from '../../../types/playlist/core';
export interface StudioKeyframeControls {
  enabled: boolean;
  zoom: number;
  onZoom: (zoom: number) => void;
  selected: {
    objectId: string;
    time: number;
    absoluteTime: number;
    x: number;
    y: number;
  } | null;
  active: boolean;
  onSelect: (id: string, time: number) => void;
  onMove: (time: number) => void;
  onPositionChange: (axis: 'x' | 'y', value: number) => void;
  onDelete: () => void;
  onClear: () => void;
}
export const useStudioKeyframes = ({
  documentKey,
  objects,
  selectedId,
  enabled,
  onSelectObject,
  onCommit,
  onSeek,
}: {
  documentKey: string;
  objects: DrawingObject[];
  selectedId: string | null;
  enabled: boolean;
  onSelectObject: (id: string) => void;
  onCommit: (objects: DrawingObject[]) => void;
  onSeek: (time: number) => void;
}): StudioKeyframeControls => {
  const [zoom, setZoom] = useState(1);
  const [selection, setSelection] = useState<{
    documentKey: string;
    id: string;
    time: number;
  } | null>(null);
  const active =
    selection?.documentKey === documentKey && selection.id === selectedId;
  const object = active
    ? objects.find((entry) => entry.id === selection.id)
    : undefined;
  const key = object?.motion?.keyframes.find(
    (entry) => entry.time === selection?.time,
  );
  const commit = (next: DrawingObject): void =>
    onCommit(objects.map((entry) => (entry.id === next.id ? next : entry)));
  return {
    zoom,
    onZoom: (value) => setZoom(Math.max(1, Math.min(16, value))),
    enabled,
    active,
    selected:
      object && key
        ? {
            objectId: object.id,
            ...key,
            absoluteTime: object.timestamp + key.time,
          }
        : null,
    onClear: () => setSelection(null),
    onSelect: (id, time) => {
      const target = objects.find((entry) => entry.id === id);
      if (!target?.motion?.keyframes.some((entry) => entry.time === time))
        return;
      onSelectObject(id);
      setSelection({ documentKey, id, time });
      onSeek(target.timestamp + time);
    },
    onMove: (absoluteTime) => {
      if (
        !enabled ||
        !object?.motion ||
        !key ||
        key.time === 0 ||
        !Number.isFinite(absoluteTime)
      )
        return;
      const index = object.motion.keyframes.indexOf(key);
      const previous = object.motion.keyframes[index - 1];
      const next = object.motion.keyframes[index + 1];
      const lower = (previous?.time ?? 0) + 0.001;
      const upper = next ? next.time - 0.001 : object.motion.duration;
      if (lower > upper) return;
      const time = Math.max(
        lower,
        Math.min(
          upper,
          Math.round((absoluteTime - object.timestamp) * 1000) / 1000,
        ),
      );
      if (time === key.time) return;
      commit({
        ...object,
        motion: {
          ...object.motion,
          keyframes: object.motion.keyframes.map((entry) =>
            entry === key ? { ...key, time } : entry,
          ),
        },
      });
      setSelection({ documentKey, id: object.id, time });
      onSeek(object.timestamp + time);
    },
    onPositionChange: (axis, value) => {
      if (
        !enabled ||
        !object?.motion ||
        !key ||
        !Number.isFinite(value) ||
        key[axis] === value ||
        Math.abs(value) > 100000
      )
        return;
      commit({
        ...object,
        motion: {
          ...object.motion,
          keyframes: object.motion.keyframes.map((entry) =>
            entry === key ? { ...key, [axis]: value } : entry,
          ),
        },
      });
    },
    onDelete: () => {
      if (!enabled || !object?.motion || !key || key.time === 0) return;
      const keys = object.motion.keyframes.filter((entry) => entry !== key);
      const previous =
        keys.filter((entry) => entry.time < key.time).at(-1) ?? keys[0];
      commit({ ...object, motion: { ...object.motion, keyframes: keys } });
      setSelection(
        previous ? { documentKey, id: object.id, time: previous.time } : null,
      );
      if (previous) onSeek(object.timestamp + previous.time);
    },
  };
};
