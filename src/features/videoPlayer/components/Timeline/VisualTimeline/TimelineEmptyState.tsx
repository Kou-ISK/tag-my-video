import type { ReactElement } from 'react';
import { Stack, Typography } from '@mui/material';
import ViewTimelineOutlinedIcon from '@mui/icons-material/ViewTimelineOutlined';

export const TimelineEmptyState = ({
  message,
}: {
  message: string;
}): ReactElement => (
  <Stack
    role="status"
    alignItems="center"
    justifyContent="center"
    spacing={1}
    sx={{ minHeight: 150, p: 3, textAlign: 'center' }}
  >
    <ViewTimelineOutlinedIcon sx={{ color: 'text.secondary' }} />
    <Typography variant="subtitle2">
      タグ付けしたプレーを、ここに集約
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Stack>
);
