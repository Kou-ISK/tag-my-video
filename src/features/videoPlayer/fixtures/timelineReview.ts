import type { TimelineData, TimelineRow } from '../../../types/timeline/core';
export const reviewRows: TimelineRow[] = [
  'アタック',
  'ディフェンス',
  'ラインブレイク',
  'キック',
  'セットプレー',
  'ターンオーバー',
  'トライ',
  'レビュー',
].map((name, index) => ({
  id: `row-${index}`,
  name,
  color: ['#1E90FF', '#FF6F61', '#45B97C', '#E4A73A'][index % 4],
}));
export const reviewTimeline: TimelineData[] = reviewRows.flatMap((row, index) =>
  [0, 1, 2].map((clip) => ({
    id: `${row.id}-${clip}`,
    actionName: row.name,
    color: row.color,
    startTime: index * 3 + clip * 35,
    endTime: index * 3 + clip * 35 + 12,
    memo: '',
  })),
);
