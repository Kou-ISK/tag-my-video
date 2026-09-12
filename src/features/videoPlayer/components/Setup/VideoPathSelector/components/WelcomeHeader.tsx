import type { ReactElement } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import SportsRugbyOutlined from '@mui/icons-material/SportsRugbyOutlined';
export const WelcomeHeader = ({ show }: { show: boolean }): ReactElement => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        width: 44,
        height: 44,
        flexShrink: 0,
        bgcolor: 'action.selected',
        borderRadius: 1.5,
        color: 'primary.main',
      }}
    >
      <SportsRugbyOutlined />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: 650, overflowWrap: 'anywhere' }}
      >
        SporTagLytics
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {show
          ? '試合映像から、分析を始めましょう。'
          : '分析の続きを、ここから。'}
      </Typography>
    </Box>
  </Stack>
);
