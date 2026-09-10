import type { ReactElement } from 'react';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import MovieOutlined from '@mui/icons-material/MovieOutlined';
import type { PlaylistItem } from '../../../types/playlist/core';

export interface StudioClipsViewProps {
  items: PlaylistItem[];
  currentIndex: number;
  onSelect: (id: string) => void;
}
export const StudioClipsView = ({
  items,
  currentIndex,
  onSelect,
}: StudioClipsViewProps): ReactElement => (
  <Stack
    component="nav"
    aria-label="Tactics クリップ"
    direction="row"
    spacing={1}
    sx={{ p: 1.5, overflowX: 'auto', height: '100%', alignItems: 'stretch' }}
  >
    {items.length === 0 ? (
      <Typography color="text.secondary" variant="body2">
        プレイリストにクリップを追加すると、Tacticsで映像へ描画できます。
      </Typography>
    ) : (
      items.map((item, index) => (
        <ButtonBase
          key={item.id}
          onClick={() => onSelect(item.id)}
          aria-current={index === currentIndex ? 'true' : undefined}
          sx={{
            width: 176,
            flexShrink: 0,
            justifyContent: 'flex-start',
            textAlign: 'left',
            p: 1.25,
            gap: 1.25,
            borderRadius: 1,
            bgcolor:
              index === currentIndex ? 'action.selected' : 'background.paper',
            border: 1,
            borderColor: index === currentIndex ? 'primary.main' : 'divider',
          }}
        >
          <MovieOutlined
            color={index === currentIndex ? 'primary' : 'disabled'}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {item.actionName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {index + 1} · {(item.endTime - item.startTime).toFixed(1)}s ·{' '}
              {item.annotation?.objects.length ?? 0} 図形
            </Typography>
          </Box>
        </ButtonBase>
      ))
    )}
  </Stack>
);
