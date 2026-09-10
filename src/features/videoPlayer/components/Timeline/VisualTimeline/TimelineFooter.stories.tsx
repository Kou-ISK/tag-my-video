import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { TimelineFooter } from './TimelineFooter';
import { TimelineEmptyState } from './TimelineEmptyState';
const meta = {
  title: 'Workspace/Timeline/Status',
  component: TimelineFooter,
  args: {
    zoomScale: 1,
    canZoomIn: true,
    canZoomOut: false,
    rowCount: 8,
    selectedCount: 3,
    onZoomIn: () => {},
    onZoomOut: () => {},
    onAddRow: () => {},
  },
} satisfies Meta<typeof TimelineFooter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Selection: Story = {
  render: function Render(args) {
    const [zoom, setZoom] = useState(1);
    return (
      <TimelineFooter
        {...args}
        zoomScale={zoom}
        canZoomOut={zoom > 1}
        canZoomIn={zoom < 4}
        onZoomIn={() => setZoom(zoom + 0.25)}
        onZoomOut={() => setZoom(zoom - 0.25)}
      />
    );
  },
};
export const Empty: Story = {
  args: { rowCount: 0, selectedCount: 0 },
  render: (args) => (
    <Box>
      <TimelineEmptyState message="アクションボタンでタグ付けを開始してください。" />
      <TimelineFooter {...args} />
    </Box>
  ),
};
