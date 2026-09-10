import { useState } from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Typography } from '@mui/material';
import { TimelineContextMenu } from './TimelineContextMenu';
const meta = {
  title: 'Workspace/Timeline/Context Menu',
  component: TimelineContextMenu,
  args: {
    anchorPosition: null,
    onClose: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onJumpTo: () => {},
    onDuplicate: () => {},
  },
} satisfies Meta<typeof TimelineContextMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
const Fixture = (): ReactElement => {
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>({
    top: 90,
    left: 60,
  });
  const [action, setAction] = useState('選択した3件のクリップ');
  return (
    <Box
      onContextMenu={(event) => {
        event.preventDefault();
        setAnchor({ top: event.clientY, left: event.clientX });
      }}
      sx={{ p: 3, height: 360, bgcolor: 'background.default' }}
    >
      <Typography role="status">{action}</Typography>
      <Typography variant="caption">
        右クリックで操作メニューを開きます。
      </Typography>
      <TimelineContextMenu
        anchorPosition={anchor}
        onClose={() => setAnchor(null)}
        selectedCount={3}
        onEdit={() => setAction('編集')}
        onDelete={() => setAction('削除')}
        onJumpTo={() => setAction('移動')}
        onDuplicate={() => setAction('複製')}
        onAddToPlaylist={() => setAction('3件をプレイリストに追加')}
      />
    </Box>
  );
};
export const Interactive: Story = { render: () => <Fixture /> };
