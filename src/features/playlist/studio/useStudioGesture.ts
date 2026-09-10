import {
  annotationAtTime,
  annotationOffsetAt,
  isAnnotationVisible,
  setAnnotationKeyframe,
} from '../../../shared/tactics/annotationMotion';
import { useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';
import type {
  DrawingObject,
  DrawingToolType,
  AnnotationTarget,
} from '../../../types/playlist/core';
import {
  findObjectAtPoint,
  getObjectBounds,
  scaleObjectForDisplay,
  shiftObject,
} from '../components/annotationCanvasUtils';
import { resizeStudioObject } from './studioGeometry';

export interface StudioContentRect {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}
interface Params {
  enabled: boolean;
  documentKey: string;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  contentRect: StudioContentRect;
  objects: DrawingObject[];
  tool: DrawingToolType;
  color: string;
  strokeWidth: number;
  opacity: number;
  fill: boolean;
  dashed: boolean;
  time: number;
  target: AnnotationTarget;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCommit: (objects: DrawingObject[]) => void;
}
interface Gesture {
  key: string;
  kind: 'draw' | 'move' | 'resize' | 'node';
  nodeIndex?: number;
  start: { x: number; y: number };
  original: DrawingObject;
  latest: DrawingObject;
  objects: DrawingObject[];
  changed: boolean;
}
export interface StudioGesture {
  displayObjects: DrawingObject[];
  handlers: {
    onPointerDown: (event: PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => void;
    onPointerCancel: () => void;
    onLostPointerCapture: () => void;
  };
  cancel: () => void;
}
export const useStudioGesture = (params: Params): StudioGesture => {
  const gesture = useRef<Gesture | null>(null);
  const [preview, setPreview] = useState<{
    key: string;
    objects: DrawingObject[];
  } | null>(null);
  const point = (
    event: PointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(
          params.contentRect.width,
          ((event.clientX - rect.left) * canvas.width) /
            Math.max(1, rect.width) -
            params.contentRect.offsetX,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          params.contentRect.height,
          ((event.clientY - rect.top) * canvas.height) /
            Math.max(1, rect.height) -
            params.contentRect.offsetY,
        ),
      ),
    };
  };
  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>): void => {
    if (!params.enabled || event.button !== 0 || params.contentRect.width <= 0)
      return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = point(event);
    if (params.tool === 'select') {
      const display = params.objects
        .filter((object) => isAnnotationVisible(object, params.time))
        .map((object) =>
          scaleObjectForDisplay(annotationAtTime(object, params.time), {
            ...params.contentRect,
            offsetX: 0,
            offsetY: 0,
          }),
        );
      const selected = display.find(
        (object) => object.id === params.selectedId,
      );
      const bounds = selected && getObjectBounds(selected);
      const nodeIndex =
        selected &&
        (selected.type === 'linkedDiscs' ||
          (selected.type === 'polygon' && (selected.path?.length ?? 0) <= 12))
          ? (selected.path?.findIndex(
              (node) => Math.hypot(start.x - node.x, start.y - node.y) < 12,
            ) ?? -1)
          : -1;
      const resize =
        bounds && Math.hypot(start.x - bounds.maxX, start.y - bounds.maxY) < 14;
      const hit =
        nodeIndex >= 0 || resize
          ? selected
          : findObjectAtPoint(display, start.x, start.y, 6);
      params.onSelect(hit?.id ?? null);
      const original = params.objects.find((object) => object.id === hit?.id);
      if (!original) return;
      gesture.current = {
        key: params.documentKey,
        kind: nodeIndex >= 0 ? 'node' : resize ? 'resize' : 'move',
        nodeIndex,
        start,
        original,
        latest: original,
        objects: params.objects,
        changed: false,
      };
    } else {
      const object: DrawingObject = {
        id: crypto.randomUUID(),
        type: params.tool,
        color: params.color,
        strokeWidth: params.strokeWidth,
        opacity: params.opacity,
        fill: params.fill,
        dashed: params.dashed,
        startX: start.x,
        startY: start.y,
        endX: start.x,
        endY: start.y,
        path: ['pen', 'polygon', 'linkedDiscs'].includes(params.tool)
          ? [start]
          : undefined,
        curvature: params.tool === 'curvedArrow' ? -0.3 : undefined,
        discRadius: params.tool === 'linkedDiscs' ? 22 : undefined,
        text: params.tool === 'text' ? 'テキスト' : undefined,
        fontSize: 28,
        timestamp: params.time,
        target: params.target,
        baseWidth: params.contentRect.width,
        baseHeight: params.contentRect.height,
      };
      gesture.current = {
        key: params.documentKey,
        kind: 'draw',
        start,
        original: object,
        latest: object,
        objects: params.objects,
        changed: params.tool === 'text',
      };
      setPreview({
        key: params.documentKey,
        objects: [...params.objects, object],
      });
    }
  };
  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>): void => {
    const current = gesture.current;
    if (
      !current ||
      current.key !== params.documentKey ||
      !event.currentTarget.hasPointerCapture(event.pointerId)
    )
      return;
    const at = point(event);
    const dx = at.x - current.start.x;
    const dy = at.y - current.start.y;
    current.changed ||= Math.hypot(dx, dy) > 2;
    if (current.kind === 'draw') {
      current.latest = {
        ...current.latest,
        endX: at.x,
        endY: at.y,
        path:
          current.latest.type === 'linkedDiscs'
            ? [
                current.start,
                {
                  x: (current.start.x + at.x) / 2,
                  y: (current.start.y + at.y) / 2,
                },
                at,
              ]
            : current.latest.path
              ? [...current.latest.path, at]
              : undefined,
      };
    } else {
      const baseDx =
        (dx * (current.original.baseWidth ?? params.contentRect.width)) /
        params.contentRect.width;
      const baseDy =
        (dy * (current.original.baseHeight ?? params.contentRect.height)) /
        params.contentRect.height;
      const bounds = getObjectBounds(current.original);
      current.latest =
        current.kind === 'node'
          ? {
              ...current.original,
              path: current.original.path?.map((node, index) =>
                index === current.nodeIndex
                  ? { x: node.x + baseDx, y: node.y + baseDy }
                  : node,
              ),
            }
          : current.kind === 'resize' && bounds
            ? resizeStudioObject(
                current.original,
                bounds.maxX - bounds.minX + baseDx,
                bounds.maxY - bounds.minY + baseDy,
              )
            : current.original.motion
              ? setAnnotationKeyframe(current.original, params.time, {
                  x:
                    annotationOffsetAt(current.original, params.time).x +
                    baseDx,
                  y:
                    annotationOffsetAt(current.original, params.time).y +
                    baseDy,
                })
              : shiftObject(current.original, baseDx, baseDy);
    }
    setPreview({
      key: current.key,
      objects:
        current.kind === 'draw'
          ? [...current.objects, current.latest]
          : current.objects.map((object) =>
              object.id === current.latest.id ? current.latest : object,
            ),
    });
  };
  const onPointerUp = (event: PointerEvent<HTMLCanvasElement>): void => {
    const current = gesture.current;
    gesture.current = null;
    setPreview(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (
      !params.enabled ||
      !current ||
      current.key !== params.documentKey ||
      !current.changed
    )
      return;
    params.onCommit(
      current.kind === 'draw'
        ? [...current.objects, current.latest]
        : current.objects.map((object) =>
            object.id === current.latest.id ? current.latest : object,
          ),
    );
    params.onSelect(current.latest.id);
  };
  const cancel = (): void => {
    gesture.current = null;
    setPreview(null);
  };
  return {
    displayObjects:
      preview?.key === params.documentKey ? preview.objects : params.objects,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: cancel,
      onLostPointerCapture: cancel,
    },
    cancel,
  };
};
