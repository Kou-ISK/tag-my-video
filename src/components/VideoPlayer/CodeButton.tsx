import { Button } from '@mui/material';
import { useState } from 'react';
import videojs from 'video.js';
import React from 'react';

interface CodeButtonProps {
  actionName: string;
  addTimelineData: (
    actionName: string,
    startTime: number,
    endTime: number,
    qualifier: string,
  ) => void;
  color:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
}

export const CodeButton = ({
  actionName,
  addTimelineData,
  color,
}: CodeButtonProps) => {
  const [isActionButonPushed, setIsActionButtonPushed] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const addTimeline = (qualifier: string) => {
    const player = videojs('video_0');

    if (player) {
      const currentTime = player.currentTime();
      if (currentTime) {
        if (!isActionButonPushed) {
          setStartTime(currentTime);
        } else {
          const newEndTime = currentTime;
          addTimelineData(actionName, startTime, newEndTime, qualifier);
        }
        setIsActionButtonPushed(!isActionButonPushed);
      }
    }
  };

  return (
    <Button
      sx={{ margin: '3px' }}
      color={color}
      variant={isActionButonPushed ? 'contained' : 'outlined'}
      onClick={() => addTimeline('')}
    >
      {actionName}
    </Button>
  );
};
