import type { SxProps, Theme } from '@mui/material/styles';

/** ボタンのラベルは一行を維持し、操作群のレイアウト側で段を分ける。 */
export const studioControlLayout = {
  '& .MuiTab-root': { px: 0.5 },
  '& .MuiButton-root, & .MuiToggleButton-root, & .MuiTab-root': {
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
} satisfies SxProps<Theme>;
