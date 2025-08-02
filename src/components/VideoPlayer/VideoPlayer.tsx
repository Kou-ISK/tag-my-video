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
}

export const VideoPlayer = ({
  videoList,
  isVideoPlaying,
  videoPlayBackRate,
  currentTime,
  setMaxSec,
  syncData,
}: VideoPlayerProps) => {
  return (
    <SyncedVideoPlayer
      videoList={videoList}
      isVideoPlaying={isVideoPlaying}
      videoPlayBackRate={videoPlayBackRate}
      currentTime={currentTime}
      setMaxSec={setMaxSec}
      syncData={syncData}
    />
  );
};
