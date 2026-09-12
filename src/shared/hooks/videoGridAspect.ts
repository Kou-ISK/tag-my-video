/** 同じ大きさのセルを、2映像は横並び・3/4映像は2×2に配置する。 */
export const videoGridAspect = (ratios: readonly number[]): number => {
  const count = ratios.length;
  const columns = count <= 1 ? 1 : count <= 4 ? 2 : 3;
  const rows = Math.max(1, Math.ceil(count / columns));
  const cell = Math.max(
    ...ratios.map((ratio) =>
      Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9,
    ),
    count ? 0 : 16 / 9,
  );
  return (cell * columns) / rows;
};
