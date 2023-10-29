import { Box, Button } from '@mui/material';
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer';
import { VideoController } from '../components/VideoPlayer/VideoController';
import { VideoPathSelector } from '../components/VideoPlayer/VideoPathSelector';
import { TimelineTable } from '../components/VideoPlayer/TimelineTable';
import { CodePanel } from '../components/VideoPlayer/CodePanel';
import { useVideoPlayerApp } from '../hooks/useVideoPlayerApp';
import { StatsModal } from '../components/VideoPlayer/StatsModal';

export const VideoPlayerApp = () => {
  const {
    timeline,
    setTimeline,
    selectedTimelineIdList,
    videoList,
    setVideoList,
    currentTime,
    setCurrentTime,
    timelineFilePath,
    setTimelineFilePath,
    metaDataConfigFilePath,
    setMetaDataConfigFilePath,
    teamNames,
    setTeamNames,
    isFileSelected,
    setIsFileSelected,
    maxSec,
    setMaxSec,
    isVideoPlaying,
    setisVideoPlaying,
    playBackRate,
    setPlayBackRate,
    handleCurrentTime,
    setPackagePath,
    addTimelineData,
    deleteTimelineDatas,
    updateQualifier,
    updateActionResult,
    updateActionType,
    getSelectedTimelineId,
    sortTimelineDatas,
  } = useVideoPlayerApp();

  return (
    <>
      {isFileSelected && (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              maxHeight: '50vh',
              margin: '0px',
            }}
          >
            {videoList !== undefined &&
              videoList.map((filePath, index) => (
                <VideoPlayer
                  key={'video_' + index}
                  videoSrc={filePath}
                  id={'video_' + index}
                  isVideoPlaying={isVideoPlaying}
                  videoPlayBackRate={playBackRate}
                  currentTime={currentTime}
                  setCurrentTime={setCurrentTime}
                  setMaxSec={setMaxSec}
                />
              ))}
          </Box>
          <Box sx={{ maxHeight: '5vh', display: 'flex', flexDirection: 'row' }}>
            <VideoController
              setIsVideoPlaying={setisVideoPlaying}
              isVideoPlaying={isVideoPlaying}
              setPlayBackRate={setPlayBackRate}
              setCurrentTime={setCurrentTime}
              handleCurrentTime={handleCurrentTime}
              maxSec={maxSec}
            />
            <Button onClick={() => deleteTimelineDatas(selectedTimelineIdList)}>
              選択したデータを削除
            </Button>
            <Button
              onClick={() =>
                window.electronAPI.exportTimeline(timelineFilePath, timeline)
              }
            >
              タイムラインを保存
            </Button>
          </Box>
          <Box
            sx={{
              maxHeight: '50vh',
              display: 'flex',
              flexDirection: 'row',
              alignContent: 'space-between',
            }}
          >
            <TimelineTable
              timelineFilePath={timelineFilePath}
              setCurrentTime={setCurrentTime}
              timeline={timeline}
              setTimeline={setTimeline}
              getSelectedTimelineId={getSelectedTimelineId}
              updateQualifier={updateQualifier}
              updateActionResult={updateActionResult}
              updateActionType={updateActionType}
              sortTimelineDatas={sortTimelineDatas}
            />
            <CodePanel
              metaDataConfigFilePath={metaDataConfigFilePath}
              addTimelineData={addTimelineData}
              teamNames={teamNames}
              setTeamNames={setTeamNames}
            />
          </Box>
          <StatsModal timeline={timeline} teamNames={teamNames} />
        </>
      )}

      {!isFileSelected && (
        <VideoPathSelector
          setVideoList={setVideoList}
          setIsFileSelected={setIsFileSelected}
          isFileSelected={isFileSelected}
          setTimelineFilePath={setTimelineFilePath}
          setPackagePath={setPackagePath}
          setMetaDataConfigFilePath={setMetaDataConfigFilePath}
        />
      )}
    </>
  );
};
