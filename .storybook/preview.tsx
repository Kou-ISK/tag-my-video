import type { Preview } from '@storybook/react-vite';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { getAppTheme } from '../src/theme';

const preview: Preview = {
  globalTypes: {
    themeMode: {
      description: 'Design System theme mode',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['dark', 'light'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const mode = context.globals.themeMode === 'light' ? 'light' : 'dark';
      return (
        <ThemeProvider theme={getAppTheme(mode)}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    controls: {
      expanded: true,
    },
  },
};

export default preview;
