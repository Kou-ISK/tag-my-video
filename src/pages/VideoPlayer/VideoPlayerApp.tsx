import { Box, Button } from '@mui/material';
import { VideoPlayer } from './VideoPlayer';
import { VideoController } from './VideoController';
import { VideoPathSelector } from './VideoPathSelector';
import { TimelineTable } from './TimelineTable';
import { CodePanel } from './CodePanel';
import { useVideoPlayerApp } from '../../hooks/useVideoPlayerApp';

export const VideoPlayerApp = () => {
    const {
        timeline, setTimeline, videoList, setVideoList,
        currentTime, setCurrentTime, timelineFilePath, setTimelineFilePath,
        isFileSelected, setIsFileSelected,
        maxSec, setMaxSec, videoState, setVideoState, playBackRate, setPlayBackRate, handleCurrentTime, packagePath, setPackagePath
    } = useVideoPlayerApp();

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
                setCurrentTime={setCurrentTime}
                handleCurrentTime={handleCurrentTime}
                maxSec={maxSec} />
            {!isFileSelected &&
                <VideoPathSelector
                    setVideoList={setVideoList}
                    setIsFileSelected={setIsFileSelected}
                    isFileSelected={isFileSelected}
                    timelineFilePath={timelineFilePath}
                    setTimelineFilePath={setTimelineFilePath}
                    setPackagePath={setPackagePath} />}
            {isFileSelected &&
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <TimelineTable timelineFilePath={timelineFilePath} setCurrentTime={setCurrentTime} timeline={timeline} setTimeline={setTimeline} />
                    <CodePanel timeline={timeline} setTimeline={setTimeline} />
                </Box>}
            <Button onClick={() => window.electronAPI.exportTimeline(packagePath + "/timeline.json", timeline)}>タイムラインを保存</Button>
        </>
    );
};