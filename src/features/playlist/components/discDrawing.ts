/** 足元マーカーの共通描画。配色は注釈データ、陰影は映像用グラフィックの材質。 */
export const drawPlayerDisc = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
): void => {
  if (rx <= 0 || ry <= 0) return;
  ctx.save();
  ctx.setLineDash([]);
  const ellipse = (cy: number, scale = 1): void => {
    ctx.beginPath();
    ctx.ellipse(x, cy, rx * scale, ry * scale, 0, 0, Math.PI * 2);
  };
  // 薄い厚みと接地影。大きな発光で選手やピッチを隠さない。
  const opacity = ctx.globalAlpha;
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = opacity * 0.24;
  ellipse(y + ry * 0.4, 1.04);
  ctx.fill();
  ctx.globalAlpha = opacity * 0.8;
  ctx.fillStyle = color;
  ellipse(y + ry * 0.22);
  ctx.fill();
  ctx.globalAlpha = opacity * 0.56;
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.globalAlpha = opacity * 0.65;
  ctx.fillStyle = color;
  ellipse(y);
  ctx.fill();
  const sheen = ctx.createLinearGradient(0, y - ry, 0, y + ry);
  sheen.addColorStop(0, 'rgba(255,255,255,0.65)');
  sheen.addColorStop(0.42, 'rgba(255,255,255,0.05)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = sheen;
  ctx.globalAlpha = opacity;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.globalAlpha = opacity * 0.65;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(0.75, rx * 0.025);
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.87, ry * 0.78, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};
