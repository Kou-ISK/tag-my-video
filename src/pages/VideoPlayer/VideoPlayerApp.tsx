import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';


export const VideoPlayerApp = () => {
    const videoList = [
        '/Users/isakakou/Desktop/夏合宿/20230807 西武台戦 引き/20230807 西武台戦 引き.mp4',
        '/Users/isakakou/Desktop/夏合宿/20230807 西武台戦 寄り/20230807 西武台戦 寄り.mp4',
    ];

    const [videoState, setVideoState] = useState<"play" | "pause" | "mute">("pause");

    const handlePlay = () => {
        setVideoState("play");
    };

    const handlePause = () => {
        setVideoState("pause");
    };

    const handleMute = () => {
        setVideoState("mute");
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                {videoList.map((filePath, index) => (
                    <VideoPlayer videoSrc={filePath} videoState={videoState} />
                ))}
            </Box>
            <Button onClick={handlePlay}>Play All</Button>
            <Button onClick={handlePause}>Pause All</Button>
            <Button onClick={handleMute}>Mute All</Button>
        </>
    );
};
