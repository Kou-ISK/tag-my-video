import { Box } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface SingleVideoPlayerProps {
  videoSrc: string;
  id: string;
  isVideoPlaying: boolean;
  videoPlayBackRate: number;
  currentTime: number;
  setMaxSec: Dispatch<SetStateAction<number>>;
  forceUpdate?: number; // 強制更新用のキー
}

export const SingleVideoPlayer: React.FC<SingleVideoPlayerProps> = ({
  videoSrc,
  id,
  isVideoPlaying,
  videoPlayBackRate,
  currentTime,
  setMaxSec,
  forceUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const option = { autoplay: true, aspectRatio: '16:9' };
      const player = videojs(videoRef.current, option);
      return () => {
        player.dispose();
      };
    }
  }, [videoRef]);

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      // videoSrc が存在する場合のみ処理
      const option = { autoplay: true, aspectRatio: '16:9' };
      const player = videojs(videoRef.current, option);

      player.ready(() => {
        const duration = player.duration();
        if (duration !== undefined) {
          setMaxSec(duration);
        }
      });
      if (isVideoPlaying) {
        player.play();
      } else if (!isVideoPlaying) {
        player.pause();
      }
      player.playbackRate(videoPlayBackRate);
    }
  }, [videoSrc, isVideoPlaying, videoRef, videoPlayBackRate]);

  useEffect(() => {
    if (videoRef.current) {
      const player = videojs(videoRef.current);
      if (!isNaN(currentTime)) {
        player.currentTime(currentTime);
      }
    }
  }, [currentTime, forceUpdate]); // forceUpdateが変更されたときにも実行
  console.log('videoSrc:', videoSrc);
  return (
    <Box width="50%" height="100%">
      <video
        ref={videoRef}
        className="video-js"
        preload="auto"
        width="640"
        height="360"
        id={id}
        controls
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </Box>
  );
};
