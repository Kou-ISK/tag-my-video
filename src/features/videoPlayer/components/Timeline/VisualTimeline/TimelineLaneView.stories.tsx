import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, useTheme } from '@mui/material';
import { TimelineLaneView } from './TimelineLaneView';

const meta = {
  title: 'Workspace/Timeline/Lane',
  component: TimelineLaneView,
  args: {
    rowId: 'attack',
    actionName: 'アタック',
    rowColor: '#1E90FF',
    laneLabelColor: '#62C8FF',
    isRowSelected: false,
    items: [
      {
        id: '1',
        actionName: 'アタック',
        startTime: 10,
        endTime: 35,
        memo: 'ラインブレイク',
      },
      {
        id: '2',
        actionName: 'アタック',
        startTime: 50,
        endTime: 85,
        memo: 'ターンオーバーからの攻撃',
      },
    ],
    selectedIds: [],
    hoveredItemId: null,
    focusedItemId: null,
    onHoverChange: () => {},
    onItemClick: () => {},
    onItemContextMenu: () => {},
    onRowClick: () => {},
    onRowContextMenu: () => {},
    onRowDragStart: () => {},
    onRowDragOver: () => {},
    onRowDrop: () => {},
    timeToPosition: (time: number) => time * 5,
    positionToTime: (px: number) => px / 5,
    currentTimePosition: 225,
    formatTime: (time: number) =>
      `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`,
    firstTeamName: 'ホーム',
    maxSec: 120,
    contentWidth: 600,
    zoomScale: 1,
    containerRef: { current: null },
    isEditModifierPressed: false,
    isTeam1: true,
    draftRange: null,
    onLaneDragOver: () => {},
    onLaneDrop: () => {},
    onRangeCreateMouseDown: () => {},
    onEdgeMouseDown: () => {},
  },
  render: function Render(args) {
    const ref = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState(args.selectedIds);
    const [rowSelected, setRowSelected] = useState(args.isRowSelected);
    const theme = useTheme();
    return (
      <Box sx={{ p: 2, overflowX: 'auto' }}>
        <TimelineLaneView
          {...args}
          containerRef={ref}
          selectedIds={selected}
          isRowSelected={rowSelected}
          laneLabelColor={theme.palette.text.primary}
          onItemClick={(_, id) => setSelected([id])}
          onRowClick={() => setRowSelected(!rowSelected)}
        />
      </Box>
    );
  },
} satisfies Meta<typeof TimelineLaneView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};
export const LongName: Story = {
  args: {
    actionName: 'ディフェンスからアタックへの切り替え',
    isRowSelected: true,
    selectedIds: ['2'],
  },
};
export const Light: Story = { globals: { themeMode: 'light' } };
