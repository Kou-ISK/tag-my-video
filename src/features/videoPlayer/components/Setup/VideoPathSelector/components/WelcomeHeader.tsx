import type { ReactElement } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

export const WelcomeHeader = ({
  show,
}: {
  show: boolean;
}): ReactElement | null =>
  show ? (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ pb: 2.5, borderBottom: 1, borderColor: 'divider' }}
    >
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          width: 48,
          height: 48,
          border: 1,
          borderColor: 'primary.main',
          borderRadius: 1,
          color: 'primary.main',
          bgcolor: (theme) => theme.custom.tokens.surface.selected,
        }}
      >
        <GraphicEqIcon />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ overflowWrap: 'anywhere' }}
        >
          SporTagLytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          映像を読み解き、次のプレーへ。
        </Typography>
      </Box>
    </Stack>
  ) : null;
