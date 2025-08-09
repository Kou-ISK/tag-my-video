import { Box } from '@mui/material';
import React from 'react';

interface TestVideoPlayerProps {
  videoSrc: string;
  id: string;
}

export const TestVideoPlayer: React.FC<TestVideoPlayerProps> = ({
  videoSrc,
  id,
}) => {
  console.log(`TestVideoPlayer ${id} レンダリング:`, {
    videoSrc,
    id,
    hasValidSrc: !!videoSrc && videoSrc.trim() !== '',
  });

  const fileUrl = videoSrc.startsWith('file://')
    ? videoSrc
    : `file://${videoSrc}`;

  return (
    <Box
      width="50%"
      height="100%"
      sx={{
        border: '3px solid green', // テスト用：緑のボーダー
        margin: '5px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(0,128,0,0.8)',
          color: 'white',
          padding: '2px 5px',
          fontSize: '12px',
          zIndex: 1000,
        }}
      >
        TEST {id}
      </div>
      <video
        width="100%"
        height="100%"
        controls
        preload="metadata"
        style={{
          border: '1px solid lime',
        }}
      >
        <source src={fileUrl} type="video/mp4" />
        <p>ビデオを読み込めません: {fileUrl}</p>
      </video>
    </Box>
  );
};
