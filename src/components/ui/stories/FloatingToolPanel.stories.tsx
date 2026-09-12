import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { FloatingToolPanel } from '../patterns/FloatingToolPanel';

const meta = {
  title: 'Design System/Patterns/FloatingToolPanel',
  component: FloatingToolPanel,
  args: {
    label: '描画ツール',
    portal: false,
    children: null,
    sx: { position: 'relative', top: 'auto', left: 'auto', width: 240 },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Shared overlay surface for compact tools. Surface, border, elevation and z-index come from semantic theme tokens.',
      },
    },
  },
} satisfies Meta<typeof FloatingToolPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Box sx={{ p: 3, minHeight: 180, bgcolor: 'background.default' }}>
      <FloatingToolPanel {...args}>
        <Stack spacing={1} sx={{ p: 1.5 }}>
          <Typography variant="sectionTitle">描画ツール</Typography>
          <Divider />
          <Typography variant="bodyCompact" color="text.secondary">
            overlay / border / focus の基準を共有します
          </Typography>
        </Stack>
      </FloatingToolPanel>
    </Box>
  ),
};
