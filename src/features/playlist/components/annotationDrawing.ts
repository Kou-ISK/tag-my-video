import { renderTacticalObject } from './tacticalDrawing';
import type { DrawingObject } from '../../../types/playlist/core';

const drawArrowHead = (
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  headLength: number = 15,
): void => {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
};

export const renderObject = (
  ctx: CanvasRenderingContext2D,
  obj: DrawingObject,
): void => {
  ctx.save();
  ctx.globalAlpha = obj.opacity ?? 1;
  ctx.setLineDash(obj.dashed ? [obj.strokeWidth * 3, obj.strokeWidth * 2] : []);
  ctx.strokeStyle = obj.color;
  ctx.fillStyle = obj.color;
  ctx.lineWidth = obj.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (obj.type) {
    case 'beam':
    case 'disc':
    case 'linkedDiscs':
    case 'curvedArrow':
      renderTacticalObject(ctx, obj);
      break;
    case 'polygon':
    case 'pen':
      if (obj.path && obj.path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(obj.path[0].x, obj.path[0].y);
        for (let i = 1; i < obj.path.length; i++) {
          ctx.lineTo(obj.path[i].x, obj.path[i].y);
        }
        if (obj.type === 'polygon') {
          ctx.closePath();
          ctx.save();
          ctx.globalAlpha *= 0.25;
          ctx.fill();
          ctx.restore();
        }
        ctx.stroke();
      }
      break;

    case 'line':
      if (obj.endX !== undefined && obj.endY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(obj.startX, obj.startY);
        ctx.lineTo(obj.endX, obj.endY);
        ctx.stroke();
      }
      break;

    case 'arrow':
      if (obj.endX !== undefined && obj.endY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(obj.startX, obj.startY);
        ctx.lineTo(obj.endX, obj.endY);
        ctx.stroke();
        drawArrowHead(
          ctx,
          obj.startX,
          obj.startY,
          obj.endX,
          obj.endY,
          obj.strokeWidth * 4,
        );
      }
      break;

    case 'rectangle':
      if (obj.endX !== undefined && obj.endY !== undefined) {
        const width = obj.endX - obj.startX;
        const height = obj.endY - obj.startY;
        if (obj.fill) {
          ctx.save();
          ctx.globalAlpha *= 0.3;
          ctx.fillRect(obj.startX, obj.startY, width, height);
          ctx.restore();
        }
        ctx.strokeRect(obj.startX, obj.startY, width, height);
      }
      break;

    case 'ring':
    case 'spotlight':
    case 'circle':
      if (obj.endX !== undefined && obj.endY !== undefined) {
        const radiusX = Math.abs(obj.endX - obj.startX) / 2;
        const radiusY = Math.abs(obj.endY - obj.startY) / 2;
        const centerX = (obj.startX + obj.endX) / 2;
        const centerY = (obj.startY + obj.endY) / 2;
        if (obj.type === 'spotlight') {
          ctx.save();
          ctx.globalAlpha *= 0.55;
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.fill('evenodd');
          ctx.restore();
        }
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        if (obj.fill || obj.type === 'ring') {
          ctx.save();
          ctx.globalAlpha *= 0.3;
          ctx.fill();
          ctx.restore();
        }
        ctx.stroke();
      }
      break;

    case 'text':
      if (obj.text) {
        ctx.font = `600 ${obj.fontSize || 24}px system-ui, sans-serif`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(obj.text, obj.startX, obj.startY);
        ctx.fillText(obj.text, obj.startX, obj.startY);
      }
      break;
  }
  ctx.restore();
};
