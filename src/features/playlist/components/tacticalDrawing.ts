import { getCurveControl } from './tacticalGeometry';
import type { DrawingObject } from '../../../types/playlist/core';

const disc = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
): void => {
  ctx.save();
  ctx.setLineDash([]);
  // 厚みのある足元マーカー。選手座標は楕円の中心。
  ctx.fillStyle = color;
  ctx.globalAlpha *= 0.35;
  ctx.beginPath();
  ctx.ellipse(x, y + ry * 0.35, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha *= 0.3;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
};

/** 編集・プレビュー・PNG書き出しで共通の戦術グラフィック描画。 */
export const renderTacticalObject = (
  ctx: CanvasRenderingContext2D,
  obj: DrawingObject,
): void => {
  const endX = obj.endX ?? obj.startX;
  const endY = obj.endY ?? obj.startY;
  if (obj.type === 'linkedDiscs' && obj.path?.length) {
    ctx.beginPath();
    obj.path.forEach((point, index) =>
      index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y),
    );
    ctx.stroke();
    const radius = obj.discRadius ?? 22;
    obj.path.forEach((point) =>
      disc(ctx, point.x, point.y, radius, radius * 0.32, obj.color),
    );
    return;
  }
  if (obj.type === 'curvedArrow') {
    const { x: cx, y: cy } = getCurveControl(obj);
    const angle = Math.atan2(endY - cy, endX - cx);
    const head = Math.max(12, obj.strokeWidth * 4);
    ctx.beginPath();
    ctx.moveTo(obj.startX, obj.startY);
    ctx.quadraticCurveTo(cx, cy, endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - head * Math.cos(angle - Math.PI / 6),
      endY - head * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      endX - head * Math.cos(angle + Math.PI / 6),
      endY - head * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
    return;
  }
  const left = Math.min(obj.startX, endX);
  const top = Math.min(obj.startY, endY);
  const width = Math.abs(endX - obj.startX);
  const height = Math.abs(endY - obj.startY);
  const x = left + width / 2;
  if (obj.type === 'beam') {
    const y = top + height;
    const fade = ctx.createLinearGradient(0, top, 0, y);
    fade.addColorStop(0, 'transparent');
    fade.addColorStop(1, obj.color);
    ctx.save();
    ctx.fillStyle = fade;
    ctx.globalAlpha *= 0.45;
    ctx.fillRect(left, top, width, height);
    ctx.restore();
    disc(ctx, x, y, width / 2, width * 0.15, obj.color);
  } else if (obj.type === 'disc') {
    disc(ctx, x, top + height / 2, width / 2, height / 2, obj.color);
  }
  if (obj.text) {
    ctx.save();
    ctx.font = `600 ${obj.fontSize ?? 20}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeText(obj.text, x, top - 8);
    ctx.fillText(obj.text, x, top - 8);
    ctx.restore();
  }
};
