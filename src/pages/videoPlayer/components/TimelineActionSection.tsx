import React from 'react';
import { Box, Paper } from '@mui/material';
import { VisualTimeline } from '../../../features/videoPlayer/components/Timeline/VisualTimeline/VisualTimeline';
import { CodePanel } from '../../../features/videoPlayer/components/Controls/CodePanel';
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
}) => (
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
      }}
    >
      <CodePanel
        metaDataConfigFilePath={metaDataConfigFilePath}
        addTimelineData={addTimelineData}
        teamNames={teamNames}
        setTeamNames={setTeamNames}
      />
    </Paper>
  </Box>
);
