import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MovieTransportView } from '../composites/MovieTransportView';
const meta = {
  title: 'Design System/Composites/Movie Transport',
  component: MovieTransportView,
  args: {
    playing: false,
    backwardLabel: '1秒戻る',
    forwardLabel: '1秒進む',
    onTogglePlay: () => {},
    onBackward: () => {},
    onForward: () => {},
    outerBackward: { label: '先頭へ', onClick: () => {} },
    outerForward: { label: '末尾へ', onClick: () => {} },
  },
} satisfies Meta<typeof MovieTransportView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  render: function Render(args) {
    const [playing, setPlaying] = useState(false);
    return (
      <MovieTransportView
        {...args}
        playing={playing}
        onTogglePlay={() => setPlaying(!playing)}
      />
    );
  },
};
export const Disabled: Story = { args: { disabled: true } };
