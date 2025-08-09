import React, { useState } from 'react';
import './App.css';
import { VideoPlayerApp } from './pages/VideoPlayerApp';
import TestVideoPage from './pages/TestVideoPage';
import { Button, Box } from '@mui/material';

function App() {
  const [showTestPage, setShowTestPage] = useState(false);

  return (
    <>
      <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
        <Button
          variant="contained"
          color={showTestPage ? 'secondary' : 'primary'}
          onClick={() => setShowTestPage(!showTestPage)}
          size="small"
        >
          {showTestPage ? '戻る' : '🧪 テスト'}
        </Button>
      </Box>

      {showTestPage ? <TestVideoPage /> : <VideoPlayerApp />}
    </>
  );
}

export default App;
