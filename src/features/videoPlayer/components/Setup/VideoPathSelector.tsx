import React from 'react';
import { CreatePackageWizard } from './VideoPathSelector/CreatePackageWizard';
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
    handleOpenPackage,
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

  return (
    <>
      <VideoPathSelectorView
        {...viewProps}
        onOpenPackage={handleOpenPackage}
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
