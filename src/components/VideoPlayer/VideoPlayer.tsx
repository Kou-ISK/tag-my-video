import React, { Dispatch, SetStateAction } from 'react';
import { SyncedVideoPlayer } from './SyncedVideoPlayer';
import { VideoSyncData } from '../../types/VideoSync';

interface VideoPlayerProps {
  videoList: string[];
  isVideoPlaying: boolean;
  videoPlayBackRate: number;
  currentTime: number;
  setMaxSec: Dispatch<SetStateAction<number>>;
  syncData?: VideoSyncData;
  syncMode?: 'auto' | 'manual';
}

export const VideoPlayer = ({
  videoList,
  isVideoPlaying,
  videoPlayBackRate,
  currentTime,
  setMaxSec,
  syncData,
  syncMode = 'auto',
}: VideoPlayerProps) => {
  return (
    <SyncedVideoPlayer
      videoList={videoList}
      isVideoPlaying={isVideoPlaying}
      videoPlayBackRate={videoPlayBackRate}
      currentTime={currentTime}
      setMaxSec={setMaxSec}
      syncData={syncData}
      syncMode={syncMode}
    />
  );
};
