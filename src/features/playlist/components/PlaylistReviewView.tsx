import type { ReactElement, ReactNode, KeyboardEventHandler } from 'react';
import { Box } from '@mui/material';
export interface PlaylistReviewViewProps {
  media: ReactNode;
  tools?: ReactNode;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  inspector: ReactNode;
  transport?: ReactNode;
}
export const PlaylistReviewView = ({
  media,
  tools,
  onKeyDown,
  inspector,
  transport,
}: PlaylistReviewViewProps): ReactElement => (
  <Box
    onKeyDown={onKeyDown}
    sx={{ display: 'flex', height: '100%', flex: 1, minWidth: 0, minHeight: 0 }}
  >
    {tools}
    <Box
      sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
    >
      <Box
        sx={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        {media}
      </Box>
      {transport}
    </Box>
    {inspector}
  </Box>
);
