import React, { useCallback, useState } from 'react';
import { Box, Stack, Button } from '@mui/material';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import { ExistingPackageLoader } from './video-path-selector/ExistingPackageLoader';
import { CreatePackageWizard } from './video-path-selector/CreatePackageWizard';
import { AudioSyncBackdrop } from './video-path-selector/AudioSyncBackdrop';
import {
  PackageLoadResult,
  VideoPathSelectorProps,
} from './video-path-selector/types';
import { useAudioSync } from './video-path-selector/hooks/useAudioSync';

export const VideoPathSelector: React.FC<VideoPathSelectorProps> = ({
  setVideoList,
  setIsFileSelected,
  setTimelineFilePath,
  setPackagePath,
  setMetaDataConfigFilePath,
  setSyncData,
}) => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { performAudioSync, status: syncStatus } = useAudioSync({ setSyncData });

  const handlePackageLoaded = useCallback(
    ({
      videoList,
      syncData,
      timelinePath,
      metaDataConfigFilePath,
      packagePath,
    }: PackageLoadResult) => {
      setVideoList(videoList);
      setSyncData(syncData);
      setTimelineFilePath(timelinePath);
      setMetaDataConfigFilePath(metaDataConfigFilePath);
      if (packagePath) {
        setPackagePath(packagePath);
      }
      setIsFileSelected(true);
    },
    [
      setIsFileSelected,
      setMetaDataConfigFilePath,
      setPackagePath,
      setSyncData,
      setTimelineFilePath,
      setVideoList,
    ],
  );

  const handlePackageCreated = useCallback(
    (payload: PackageLoadResult) => {
      handlePackageLoaded(payload);
      setWizardOpen(false);
    },
    [handlePackageLoaded],
  );

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', mt: 4, px: 3 }}>
      <Stack spacing={3}>
        <ExistingPackageLoader
          onPackageLoaded={handlePackageLoaded}
          performAudioSync={performAudioSync}
        />

        <Button
          sx={{ height: '120px', fontSize: '18px' }}
          onClick={() => setWizardOpen(true)}
          variant="outlined"
          size="large"
          startIcon={<VideoFileIcon />}
        >
          新規パッケージを作成
        </Button>
      </Stack>

      <CreatePackageWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onPackageCreated={handlePackageCreated}
        performAudioSync={performAudioSync}
        syncStatus={syncStatus}
      />

      <AudioSyncBackdrop status={syncStatus} />
    </Box>
  );
};
