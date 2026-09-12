import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { VideoControllerToolbar } from './VideoControllerToolbar';

const meta = {
  title: 'Workspace/Transport',
  component: VideoControllerToolbar,
  decorators: [
    (Story) => (
      <Box sx={{ p: 2 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    hasVideos: true,
    isVideoPlaying: false,
    playbackRate: 1,
    speedOptions: [0.25, 0.5, 1, 1.5, 2, 4, 6],
    flashStates: {},
    onTogglePlayback: () => {},
    onSeekAdjust: () => {},
    onSpeedPresetSelect: () => {},
    onSpeedChange: () => {},
    triggerFlash: () => {},
    currentTimeLabel: '24:18 / 80:00',
    smallSkipSeconds: 10,
    largeSkipSeconds: 30,
  },
} satisfies Meta<typeof VideoControllerToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  render: function Render(args) {
    const [playing, setPlaying] = useState(false);
    const [rate, setRate] = useState(1);
    return (
      <VideoControllerToolbar
        {...args}
        isVideoPlaying={playing}
        playbackRate={rate}
        onTogglePlayback={() => setPlaying(!playing)}
        onSpeedPresetSelect={setRate}
        onSpeedChange={(event) => setRate(Number(event.target.value))}
      />
    );
  },
};
export const NoVideo: Story = {
  args: { hasVideos: false, currentTimeLabel: '00:00 / 00:00' },
};
export const Light: Story = { globals: { themeMode: 'light' } };
