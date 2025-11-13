import React, { useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { VisualTimeline } from '../../../features/videoPlayer/components/Timeline/VisualTimeline/VisualTimeline';
import { EnhancedCodePanel } from '../../../features/videoPlayer/components/Controls/EnhancedCodePanel';
import { TimelineData } from '../../../types/TimelineData';

interface TimelineActionSectionProps {
  timeline: TimelineData[];
  maxSec: number;
  currentTime: number;
  selectedTimelineIdList: string[];
  metaDataConfigFilePath: string;
  teamNames: string[];
  setTimeline: React.Dispatch<React.SetStateAction<TimelineData[]>>;
  setTeamNames: React.Dispatch<React.SetStateAction<string[]>>;
  addTimelineData: (
    actionName: string,
    startTime: number,
    endTime: number,
    qualifier: string,
  ) => void;
  deleteTimelineDatas: (ids: string[]) => void;
  updateQualifier: (id: string, qualifier: string) => void;
  updateActionType: (id: string, actionType: string) => void;
  updateActionResult: (id: string, actionResult: string) => void;
  updateTimelineRange: (id: string, startTime: number, endTime: number) => void;
  updateTimelineItem: (
    id: string,
    updates: Partial<Omit<TimelineData, 'id'>>,
  ) => void;
  handleCurrentTime: (
    event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => void;
}

export const TimelineActionSection: React.FC<TimelineActionSectionProps> = ({
  timeline,
  maxSec,
  currentTime,
  selectedTimelineIdList,
  metaDataConfigFilePath,
  teamNames,
  setTimeline,
  setTeamNames,
  addTimelineData,
  deleteTimelineDatas,
  updateQualifier,
  updateActionType,
  updateActionResult,
  updateTimelineRange,
  updateTimelineItem,
  handleCurrentTime,
}) => {
  // metaDataConfigFilePathからチーム名を読み込む
  useEffect(() => {
    if (!metaDataConfigFilePath) return;

    let isActive = true;

    fetch(metaDataConfigFilePath)
      .then((response) => response.json())
      .then((data) => {
        if (!isActive || !data) return;

        if (data.team1Name && data.team2Name) {
          setTeamNames([data.team1Name, data.team2Name]);
        }
      })
      .catch((error) => console.error('Error loading JSON:', error));

    return () => {
      isActive = false;
    };
  }, [metaDataConfigFilePath, setTeamNames]);

  // タイムラインから最初のチーム名を計算（タイムラインの色と一致させるため）
  const firstTeamName = React.useMemo(() => {
    if (timeline.length === 0) return teamNames[0];
    // タイムラインのアクション名をソートして最初のチーム名を取得
    const sortedActionNames = [
      ...new Set(timeline.map((t) => t.actionName)),
    ].sort((a, b) => a.localeCompare(b));
    return sortedActionNames[0]?.split(' ')[0] || teamNames[0];
  }, [timeline, teamNames]);

  return (
    <Box
      sx={{
        gridColumn: '1',
        gridRow: '2',
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        minHeight: 0,
        gap: 1.5,
        p: 1.5,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <VisualTimeline
          timeline={timeline}
          maxSec={maxSec}
          currentTime={currentTime}
          onSeek={(time: number) => {
            const event = new Event('visual-timeline-seek');
            handleCurrentTime(event, time);
          }}
          onDelete={deleteTimelineDatas}
          selectedIds={selectedTimelineIdList}
          onSelectionChange={(ids: string[]) => {
            const updated = timeline.map((item) => ({
              ...item,
              isSelected: ids.includes(item.id),
            }));
            setTimeline(updated);
          }}
          onUpdateQualifier={updateQualifier}
          onUpdateActionType={updateActionType}
          onUpdateActionResult={updateActionResult}
          onUpdateTimeRange={updateTimelineRange}
          onUpdateTimelineItem={updateTimelineItem}
        />
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          p: 1.5,
        }}
      >
        <EnhancedCodePanel
          addTimelineData={addTimelineData}
          teamNames={teamNames}
          firstTeamName={firstTeamName}
        />
      </Paper>
    </Box>
  );
};
