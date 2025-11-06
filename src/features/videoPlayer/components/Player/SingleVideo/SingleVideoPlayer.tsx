import { Box, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useVideoJsPlayer } from './hooks/useVideoJsPlayer';
import { usePlaybackBehaviour } from './hooks/usePlaybackBehaviour';
import type { SingleVideoPlayerProps } from './types';

export const SingleVideoPlayer: React.FC<SingleVideoPlayerProps> = ({
  videoSrc,
  id,
  isVideoPlaying,
  videoPlayBackRate,
  setMaxSec,
  forceUpdate = 0,
  blockPlay = false,
  allowSeek = true,
  onAspectRatioChange,
}) => {
  const { containerRef, videoRef, playerRef, isReady, durationSec } =
    useVideoJsPlayer({
      id,
      videoSrc,
      allowSeek,
      setMaxSec,
      onAspectRatioChange,
    });

  const [showEndMask, setShowEndMask] = useState(false);

  usePlaybackBehaviour({
    playerRef,
    id,
    isReady,
    isVideoPlaying,
    blockPlay,
    videoPlayBackRate,
    durationSec,
    setShowEndMask,
  });

  void forceUpdate;

  const overlayMessage = useMemo(() => {
    if (blockPlay) {
      return '同期オフセットを待機中…';
    }
    if (showEndMask) {
      return '再生終了';
    }
    return null;
  }, [blockPlay, showEndMask]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        inset: 0,
        '& .video-js': {
          height: '100%',
          width: '100%',
          backgroundColor: '#000',
        },
        '& .vjs-tech': {
          objectFit: 'contain',
        },
      }}
    >
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        id={id}
        controls={allowSeek}
        preload="auto"
        playsInline
      />
      {overlayMessage && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(12,12,15,0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="common.white">
            {overlayMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
