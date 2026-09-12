import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import type { AnalysisView } from '../../../../../../../types/analysis/view';
import { AnalysisPanelToolbar } from './AnalysisPanelToolbar';
const meta = {
  title: 'Workspace/Analysis/Toolbar',
  component: AnalysisPanelToolbar,
  decorators: [
    (Story) => (
      <Box
        sx={{
          p: 1,
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <Story />
      </Box>
    ),
  ],
  args: {
    currentView: 'dashboard',
    onChangeView: () => {},
    isExporting: false,
    exportAnchor: null,
    setExportAnchor: () => {},
    onCloseExportMenu: () => {},
    onCopySummary: () => {},
    onExportPng: () => {},
    onExportPdf: () => {},
  },
} satisfies Meta<typeof AnalysisPanelToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  render: function Render(args) {
    const [view, setView] = useState<AnalysisView>('dashboard');
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    return (
      <AnalysisPanelToolbar
        {...args}
        currentView={view}
        onChangeView={setView}
        exportAnchor={anchor}
        setExportAnchor={setAnchor}
        onCloseExportMenu={() => setAnchor(null)}
      />
    );
  },
};
export const Exporting: Story = { args: { isExporting: true } };
