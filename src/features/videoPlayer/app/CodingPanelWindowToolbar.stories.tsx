import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodingPanelWindowToolbar } from './CodingPanelWindowToolbar';
import type { CodingPanelWindowMode } from './CodingPanelWindowToolbar';
const meta = {
  title: 'Workspace/Code Window/Toolbar',
  component: CodingPanelWindowToolbar,
  args: {
    mode: 'code',
    title: '試合分析｜アタック・ディフェンス',
    canSave: true,
    onModeChange: () => {},
    onSave: () => {},
    onSaveAs: () => {},
  },
} satisfies Meta<typeof CodingPanelWindowToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Modes: Story = {
  render: function Render(args) {
    const [mode, setMode] = useState<CodingPanelWindowMode>('code');
    return (
      <CodingPanelWindowToolbar
        {...args}
        mode={mode}
        onModeChange={(_, value) => {
          if (value) setMode(value);
        }}
      />
    );
  },
};
export const Edit: Story = { args: { mode: 'edit' } };
export const ReadOnly: Story = { args: { mode: 'edit', canSave: false } };
