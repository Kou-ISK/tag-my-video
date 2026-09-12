import { ActionPresetProvider } from '../../../../../contexts/ActionPresetContext';
import { useState } from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Typography } from '@mui/material';
import { NotificationProvider } from '../../../../../contexts/NotificationProvider';
import { VisualTimelineView } from './VisualTimelineView';
import { useVisualTimelineController } from './hooks/useVisualTimelineController';
import { reviewRows, reviewTimeline } from '../../../fixtures/timelineReview';
const TimelineFixture = (): ReactElement => {
  const [timeline, setTimeline] = useState(reviewTimeline);
  const [time, setTime] = useState(45);
  const [selected, setSelected] = useState<string[]>([]);
  const props = useVisualTimelineController({
    timeline,
    onUpdateTimeRange: (id, startTime, endTime) =>
      setTimeline((current) =>
        current.map((item) =>
          item.id === id ? { ...item, startTime, endTime } : item,
        ),
      ),
    rows: reviewRows,
    maxSec: 120,
    currentTime: time,
    onSeek: setTime,
    onDelete: () => {},
    selectedIds: selected,
    onSelectionChange: setSelected,
    teamNames: ['ホーム', 'アウェイ'],
  });
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="technical" data-testid="seek-time">
        {time.toFixed(3)}
      </Typography>
      <Box sx={{ height: 265, mt: 1, border: 1, borderColor: 'divider' }}>
        <VisualTimelineView {...props} />
      </Box>
    </Box>
  );
};
const meta: Meta<typeof VisualTimelineView> = {
  title: 'Workspace/Timeline/Continuous',
  component: VisualTimelineView,
  decorators: [
    (Story) => (
      <NotificationProvider>
        <ActionPresetProvider>
          <Story />
        </ActionPresetProvider>
      </NotificationProvider>
    ),
  ],
  render: () => <TimelineFixture />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};
