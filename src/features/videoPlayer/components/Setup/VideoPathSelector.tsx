import React from 'react';
import { CreatePackageWizard } from './VideoPathSelector/CreatePackageWizard';
import { useExistingPackageLoaderController } from './VideoPathSelector/hooks/useExistingPackageLoaderController';
import { VideoPathSelectorView } from './VideoPathSelectorView';
import type { VideoPathSelectorProps } from './VideoPathSelector/types';
import { useVideoPathSelectorController } from './VideoPathSelector/hooks/useVideoPathSelectorController';

export const VideoPathSelector: React.FC<VideoPathSelectorProps> = ({
  openWizardRequestKey,
  setVideoList,
  setIsFileSelected,
  setTimelineFilePath,
  setPackagePath,
  setMetaDataConfigFilePath,
  setSyncData,
  setMediaAngles,
}) => {
  const {
    handlePackageCreated,
    handlePackageLoaded,
    handleOpenWizard,
    handleCloseWizard,
    handleRecentPackageOpen,
    removeRecentPackage,
    ...viewProps
  } = useVideoPathSelectorController({
    openWizardRequestKey,
    setVideoList,
    setIsFileSelected,
    setTimelineFilePath,
    setPackagePath,
    setMetaDataConfigFilePath,
    setSyncData,
    setMediaAngles,
  });

  const { handleSelectPackage } = useExistingPackageLoaderController({
    onPackageLoaded: handlePackageLoaded,
  });

  return (
    <>
      <VideoPathSelectorView
        {...viewProps}
        onOpenPackage={() => {
          void handleSelectPackage();
        }}
        onOpenWizard={handleOpenWizard}
        onOpenRecentPackage={handleRecentPackageOpen}
        onRemoveRecentPackage={removeRecentPackage}
      />
      <CreatePackageWizard
        open={viewProps.wizardOpen}
        onClose={handleCloseWizard}
        onPackageCreated={handlePackageCreated}
      />
    </>
  );
};
