import React, { useState } from 'react';
import { SyncedVideoPlayer } from '../features/video-player/SyncedVideoPlayer';
import { Button, Box, TextField } from '@mui/material';

const TestVideoPage: React.FC = () => {
  const [videoList, setVideoList] = useState<string[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [videoPlayBackRate, setVideoPlayBackRate] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTime, setCurrentTime] = useState(0);
  const [maxSec, setMaxSec] = useState(100);
  const [testPath1, setTestPath1] = useState(
    '/Users/isakakou/Desktop/sample/videos/sample 寄り.mp4',
  );
  const [testPath2, setTestPath2] = useState(
    '/Users/isakakou/Desktop/sample/videos/sample 引き.mp4',
  );

  console.log('🧪 TestVideoPage: レンダリング', {
    videoList,
    videoListLength: videoList.length,
    timestamp: new Date().toISOString(),
  });

  const loadTestVideos = () => {
    console.log('🧪 TestVideoPage: テストビデオを読み込み中...');
    const newVideoList = [testPath1, testPath2];
    console.log('🧪 新しいvideoList:', newVideoList);
    setVideoList(newVideoList);
  };

  const clearVideos = () => {
    console.log('🧪 TestVideoPage: ビデオをクリア');
    setVideoList([]);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <h1>🧪 Video Player Test Page</h1>

      <Box sx={{ marginBottom: 2 }}>
        <TextField
          label="Video 1 Path"
          value={testPath1}
          onChange={(e) => setTestPath1(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Video 2 Path"
          value={testPath2}
          onChange={(e) => setTestPath2(e.target.value)}
          fullWidth
          margin="normal"
        />
      </Box>

      <Box sx={{ marginBottom: 2 }}>
        <Button
          variant="contained"
          onClick={loadTestVideos}
          sx={{ marginRight: 1 }}
        >
          Load Test Videos
        </Button>
        <Button
          variant="outlined"
          onClick={clearVideos}
          sx={{ marginRight: 1 }}
        >
          Clear Videos
        </Button>
        <Button
          variant="contained"
          color={isVideoPlaying ? 'secondary' : 'primary'}
          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
        >
          {isVideoPlaying ? 'Pause' : 'Play'}
        </Button>
      </Box>

      <Box sx={{ marginBottom: 2, border: '2px solid orange', padding: 1 }}>
        <h3>Debug Info:</h3>
        <div>Video List Length: {videoList.length}</div>
        <div>Is Playing: {isVideoPlaying.toString()}</div>
        <div>Current Time: {currentTime}</div>
        <div>Max Sec: {maxSec}</div>
        <div>Video List: {JSON.stringify(videoList)}</div>
      </Box>

      {videoList.length > 0 && (
        <SyncedVideoPlayer
          videoList={videoList}
          isVideoPlaying={isVideoPlaying}
          videoPlayBackRate={videoPlayBackRate}
          setMaxSec={setMaxSec}
        />
      )}
    </Box>
  );
};

export default TestVideoPage;
