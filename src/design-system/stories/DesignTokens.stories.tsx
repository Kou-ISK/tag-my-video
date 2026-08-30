import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Stack, Typography, useTheme } from '@mui/material';

const meta = {
  title: 'Design System/Foundation/Tokens',
  parameters: {
    docs: {
      description: {
        component:
          'Semantic tokens are the source used by both dark and light themes.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TokenSwatch = ({
  name,
  value,
}: {
  name: string;
  value: string;
}): ReactElement => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      aria-label={`${name}: ${value}`}
      sx={{ width: 28, height: 28, bgcolor: value, border: '1px solid', borderColor: 'divider' }}
    />
    <Typography variant="bodyCompact">
      {name}: {value}
    </Typography>
  </Stack>
);

const TokensStory = (): ReactElement => {
  const theme = useTheme();
  const { surface, content, border, interactive, status } = theme.custom.tokens;
  return (
    <Stack spacing={2} sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="heading">Semantic tokens</Typography>
      <Stack spacing={1}>
        <Typography variant="sectionTitle">Surface</Typography>
        {Object.entries(surface).map(([name, value]) => (
          <TokenSwatch key={name} name={`surface.${name}`} value={value} />
        ))}
      </Stack>
      <Stack spacing={1}>
        <Typography variant="sectionTitle">Content / border / interaction</Typography>
        {Object.entries({ ...content, ...border, ...interactive }).map(([name, value]) => (
          <TokenSwatch key={name} name={name} value={value} />
        ))}
      </Stack>
      <Stack spacing={1}>
        <Typography variant="sectionTitle">Status</Typography>
        {Object.entries(status).map(([name, value]) => (
          <TokenSwatch key={name} name={`status.${name}`} value={value} />
        ))}
      </Stack>
    </Stack>
  );
};

export const Dark: Story = { render: TokensStory };
export const Light: Story = { render: TokensStory, globals: { themeMode: 'light' } };
