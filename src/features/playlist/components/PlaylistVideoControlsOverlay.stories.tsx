import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import { PlaylistVideoControlsOverlay } from './PlaylistVideoControlsOverlay';
const meta = {
  title: 'Workspace/Playlist/Movie Controller',
  component: PlaylistVideoControlsOverlay,
  decorators: [
    (Story) => (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 320,
          bgcolor: 'background.default',
        }}
      >
        <Story />
      </Box>
    ),
  ],
  args: {
    visible: true,
    currentTime: 12,
    sliderMin: 0,
    sliderMax: 30,
    marks: [
      { value: 6, label: '' },
      { value: 18, label: '' },
      { value: 24, label: '' },
    ],
    isPlaying: false,
    isFrozen: false,
    autoAdvance: true,
    loopPlaylist: false,
    isDrawingMode: false,
    isMuted: false,
    volume: 0.7,
    isFullscreen: false,
    onSeek: () => {},
    onSeekCommitted: () => {},
    onPrevious: () => {},
    onTogglePlay: () => {},
    onNext: () => {},
    onToggleAutoAdvance: () => {},
    onToggleLoop: () => {},
    onToggleDrawingMode: () => {},
    onToggleMute: () => {},
    onVolumeChange: () => {},
    onToggleFullscreen: () => {},
  },
} satisfies Meta<typeof PlaylistVideoControlsOverlay>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  render: function Render(args) {
    const [time, setTime] = useState(12);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [muted, setMuted] = useState(false);
    const [loop, setLoop] = useState(false);
    return (
      <PlaylistVideoControlsOverlay
        {...args}
        currentTime={time}
        isPlaying={playing}
        volume={volume}
        isMuted={muted}
        loopPlaylist={loop}
        onSeek={(_, value) => {
          if (typeof value === 'number') setTime(value);
        }}
        onTogglePlay={() => setPlaying(!playing)}
        onVolumeChange={(_, value) => {
          if (typeof value === 'number') setVolume(value);
        }}
        onToggleMute={() => setMuted(!muted)}
        onToggleLoop={() => setLoop(!loop)}
      />
    );
  },
};
export const Light: Story = { globals: { themeMode: 'light' } };
export const AutoHidden: Story = { args: { visible: false } };
