import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsHeader } from './SettingsHeader';
const meta = {
  title: 'Workspace/Settings/Header',
  component: SettingsHeader,
  args: { onClose: () => {} },
} satisfies Meta<typeof SettingsHeader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Dark: Story = {};
export const Light: Story = { globals: { themeMode: 'light' } };
