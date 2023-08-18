import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import { Box, Button } from "@mui/material";
import { VideoPlayerView } from "./VideoPlayerView";
import Player from "video.js/dist/types/player";

export const VideoPlayerApp = () => {
    const videoList = [
        '/Users/isakakou/Desktop/MAH00240.MP4',
        '/Users/isakakou/Desktop/MAH00122.MP4'
    ];

    const [players, setPlayers] = useState<Player[]>([]);
    const videoRefs = useRef<Player[]>([]);

    useEffect(() => {
        videoRefs.current = videoList.map(() => {
            const player = videojs(document.createElement('video'));
            return player;
        });

        setPlayers(videoRefs.current);

        return () => {
            videoRefs.current.forEach(player => player.dispose());
        };
    }, [videoList]);

    const handleJump = (time: number) => {
        players.forEach(player => {
            player.currentTime(time);
        });
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                {videoList.map((filePath, index) => (
                    <VideoPlayerView key={index} id={'video' + index.toString()} filePath={filePath} player={players[index]} />
                ))}
            </Box>
            <Button onClick={() => handleJump(10)}>Jump to 10 seconds</Button>
        </>
    );
};
