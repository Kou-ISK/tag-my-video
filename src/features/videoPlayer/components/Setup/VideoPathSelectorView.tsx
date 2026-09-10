import React from 'react';
import { Box, Stack } from '@mui/material';
import { WelcomeHeader } from './VideoPathSelector/components/WelcomeHeader';
import { DropZoneCard } from './VideoPathSelector/components/DropZoneCard';
import { ActionButtonsRow } from './VideoPathSelector/components/ActionButtonsRow';
import { RecentPackagesSection } from './VideoPathSelector/components/RecentPackagesSection';
import type { DragAndDropState } from './VideoPathSelector/hooks/useDragAndDrop';
import type { RecentPackage } from './VideoPathSelector/hooks/useRecentPackages';

interface VideoPathSelectorViewProps {
  showWelcome: boolean;
  dragState: DragAndDropState;
  dragHandlers: React.HTMLAttributes<HTMLDivElement>;
  recentPackages: RecentPackage[];
  onOpenPackage: () => void;
  onOpenWizard: () => void;
  onOpenRecentPackage: (path: string) => void;
  onRemoveRecentPackage: (path: string) => void;
}

export const VideoPathSelectorView: React.FC<VideoPathSelectorViewProps> = ({
  showWelcome,
  dragState,
  dragHandlers,
  recentPackages,
  onOpenPackage,
  onOpenWizard,
  onOpenRecentPackage,
  onRemoveRecentPackage,
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        mx: 'auto',
        my: { xs: 2, md: 5 },
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        maxWidth: 1180,
        bgcolor: 'background.default',
        color: 'text.primary',
        fontFamily: 'inherit',
      }}
      {...dragHandlers}
    >
      <Stack spacing={3}>
        <WelcomeHeader show={showWelcome} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(260px, 0.85fr) minmax(0, 1.5fr)',
            },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Stack spacing={2}>
            <ActionButtonsRow
              onOpenPackage={onOpenPackage}
              onOpenWizard={onOpenWizard}
            />
            <DropZoneCard dragState={dragState} />
          </Stack>
          <RecentPackagesSection
            packages={recentPackages}
            onOpen={onOpenRecentPackage}
            onRemove={onRemoveRecentPackage}
          />
        </Box>
      </Stack>
    </Box>
  );
};
