import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { VideoController } from './VideoController';
import { VideoPathSelector } from './VideoPathSelector';


export const VideoPlayerApp = () => {
    const [videoList, setVideoList] = useState<string[]>([]
        // ['/Users/isakakou/Desktop/夏合宿/20230807 西武台戦 寄り/20230807 西武台戦 寄り.mp4',
        //     '/Users/isakakou/Desktop/夏合宿/20230807 西武台戦 引き/20230807 西武台戦 引き.mp4']
    );

    const [currentTime, setCurrentTime] = useState(0);

    const [isFileSelected, setIsFileSelected] = useState(false);

    const handleCurrentTime = (event: Event, newValue: number | number[]) => {
        setCurrentTime(newValue as number);
    };

    const [maxSec, setMaxSec] = useState(1000);

    const [videoState, setVideoState] = useState<"play" | "pause" | "mute">("pause");
    const [playBackRate, setPlayBackRate] = useState(1);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                {videoList.map((filePath, index) => (
                    <VideoPlayer key={'video_' + index}
                        videoSrc={filePath} id={'video_' + index}
                        videoState={videoState}
                        videoPlayBackRate={playBackRate}
                        currentTime={currentTime}
                        setMaxSec={setMaxSec} />
                ))}
            </Box>
            <VideoController
                setVideoState={setVideoState}
                setPlayBackRate={setPlayBackRate}
                currentTime={currentTime}
                handleCurrentTime={handleCurrentTime}
                maxSec={maxSec} />
            {!isFileSelected &&
                <VideoPathSelector
                    videoList={videoList}
                    setVideoList={setVideoList}
                    setIsFileSelected={setIsFileSelected}
                    isFileSelected={isFileSelected} />}
        </>
    );
};
