import type { Meta, StoryObj } from '@storybook/react-vite';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import { Stack, Typography } from '@mui/material';
import { IconAction } from '../primitives/IconAction';

const meta = {
  title: 'Design System/Primitives/IconAction',
  component: IconAction,
  args: {
    icon: <PlayArrowIcon />,
    label: '再生',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Icon-only action with an accessible name, tooltip and keyboard focus state.',
      },
    },
  },
} satisfies Meta<typeof IconAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    icon: <SaveIcon />,
    label: '保存済み',
    color: 'primary',
    sx: {
      bgcolor: 'action.selected',
      '&:hover': { bgcolor: 'action.selected' },
    },
  },
};

export const DisabledAndLoading: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 3 }}>
      <IconAction {...args} label="無効な操作" disabled />
      <IconAction {...args} label="保存中" loading />
      <Typography variant="bodyCompact" color="text.secondary">
        Tab キーで各 target を確認できます
      </Typography>
    </Stack>
  ),
};
