// VideoPlayerApp.tsx

import { Box, Button } from '@mui/material';
import { VideoPlayerView } from './VideoPlayerView';
import videojs from 'video.js';
import { Player } from 'videojs';
import { useState } from 'react';

export const VideoPlayerApp = () => {
    const videoList = [
        '/Users/isakakou/Desktop/MAH00240.MP4',
        '/Users/isakakou/Desktop/MAH00122.MP4'
    ];

    const [players, setPlayers] = useState<Player[]>([]);

    const onPlayerReady = (player: Player) => {
        setPlayers([...players, player])
    };

    const pause = () => {
        players.forEach(player => player.pause());
    };

    const play = () => {
        players.forEach(player => player.play());
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                {videoList.map((filePath, index) => (
                    <VideoPlayerView key={index} id={'video' + index.toString()} filePath={filePath} onPlayerReady={onPlayerReady} />
                ))}
            </Box>
            <Button onClick={play}>再生</Button>
            <Button onClick={pause}>一時停止</Button>
        </>
    );
};
