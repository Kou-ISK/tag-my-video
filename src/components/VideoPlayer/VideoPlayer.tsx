import { Box } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import { SingleVideoPlayer } from './SingleVideoPlayer';

interface VideoPlayerProps {
  videoList: string[];
  isVideoPlaying: boolean;
  videoPlayBackRate: number;
  currentTime: number;
  setMaxSec: Dispatch<SetStateAction<number>>;
}

export const VideoPlayer = ({
  videoList,
  isVideoPlaying,
  videoPlayBackRate,
  currentTime,
  setMaxSec,
}: VideoPlayerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        margin: '0px',
        justifyContent: 'center', // 映像を中央に配置
        alignItems: 'center', // 垂直方向にも中央に配置
      }}
    >
      {videoList !== undefined &&
        videoList.map((filePath, index) => (
          <SingleVideoPlayer
            key={index}
            videoSrc={filePath}
            id={'video_' + index}
            isVideoPlaying={isVideoPlaying}
            videoPlayBackRate={videoPlayBackRate}
            currentTime={currentTime}
            setMaxSec={setMaxSec}
          />
        ))}
    </Box>
  );
};
