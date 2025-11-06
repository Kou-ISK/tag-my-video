import React from 'react';
import { Box, Grid } from '@mui/material';
import { MemoizedSingleVideoPlayer } from '../SingleVideoPlayer';
import { useSyncedVideoPlayer } from './hooks/useSyncedVideoPlayer';
import type { SyncedVideoPlayerProps } from './types';

const DEFAULT_ASPECT_RATIO = 16 / 9;

const noopSetMax: React.Dispatch<React.SetStateAction<number>> = (value) => {
  void value;
};

export const SyncedVideoPlayer: React.FC<SyncedVideoPlayerProps> = ({
  videoList,
  isVideoPlaying,
  videoPlayBackRate,
  setMaxSec,
  syncData,
  syncMode = 'auto',
  forceUpdateKey = 0,
}) => {
  const allowSeek = syncMode === 'manual';
  const offset = syncData?.syncOffset ?? 0;

  const {
    blockPlayStates,
    aspectRatios,
    handleAspectRatioChange,
    activeVideoCount,
  } = useSyncedVideoPlayer({
    videoList,
    isVideoPlaying,
    videoPlayBackRate,
    setMaxSec,
    syncData,
    syncMode,
    forceUpdateKey,
  });

  return (
    <Grid
      container
      spacing={0}
      sx={{ width: '100%', margin: 0, padding: 0, alignItems: 'start' }}
    >
      {videoList.map((filePath, index) => {
        if (!filePath || filePath.trim() === '') {
          return null;
        }

        const columns = activeVideoCount > 1 ? 6 : 12;
        const aspectRatio = aspectRatios[index] ?? DEFAULT_ASPECT_RATIO;
        const paddingTop =
          aspectRatio > 0 ? `${(1 / aspectRatio) * 100}%` : '56.25%';

        return (
          <Grid
            key={`${filePath}-${index}`}
            item
            xs={12}
            md={columns}
            sx={{ padding: 0 }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop,
                height: 0,
                overflow: 'hidden',
                backgroundColor: '#000',
              }}
            >
              <MemoizedSingleVideoPlayer
                videoSrc={filePath}
                id={`video_${index}`}
                isVideoPlaying={isVideoPlaying}
                videoPlayBackRate={videoPlayBackRate}
                setMaxSec={index === 0 ? setMaxSec : noopSetMax}
                blockPlay={blockPlayStates[index] ?? false}
                allowSeek={allowSeek}
                forceUpdate={forceUpdateKey}
                offsetSeconds={index === 0 ? 0 : offset}
                onAspectRatioChange={(ratio) =>
                  handleAspectRatioChange(index, ratio)
                }
              />
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
};
