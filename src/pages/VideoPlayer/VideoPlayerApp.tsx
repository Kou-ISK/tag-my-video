import { Box } from '@mui/material';
import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { VideoController } from './VideoController';
import { VideoPathSelector } from './VideoPathSelector';
import { TimelineTable } from './TimelineTable';
import { CodePanel } from './CodePanel';
import { TimelineData } from '../../types/TimelineData';


export const VideoPlayerApp = () => {
    const [videoList, setVideoList] = useState<string[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [timelineFilePath, setTimelineFilePath] = useState<string | undefined>();
    const [timeline, setTimeline] = useState<TimelineData[]>([]);

    const [isFileSelected, setIsFileSelected] = useState(false);

    const handleCurrentTime = (event: Event, newValue: number | number[]) => {
        setCurrentTime(newValue as number);
    };

    const [maxSec, setMaxSec] = useState(0);

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
                    setVideoList={setVideoList}
                    setIsFileSelected={setIsFileSelected}
                    isFileSelected={isFileSelected}
                    timelineFilePath={timelineFilePath}
                    setTimelineFilePath={setTimelineFilePath} />}
            {isFileSelected &&
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <TimelineTable timelineFilePath={timelineFilePath} setCurrentTime={setCurrentTime} timeline={timeline} />
                    <CodePanel timeline={timeline} setTimeline={setTimeline} />
                </Box>}
        </>
    );
};
