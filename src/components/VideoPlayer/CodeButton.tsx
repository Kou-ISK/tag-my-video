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
  color: 'team1' | 'team2';
}

export const CodeButton = ({
  actionName,
  addTimelineData,
  color,
}: CodeButtonProps) => {
  const [isActionButonPushed, setIsActionButtonPushed] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);

  const addTimeline = (qualifier: string) => {
    type VjsNamespace = {
      getPlayer?: (id: string) =>
        | {
            currentTime?: () => number | undefined;
          }
        | undefined;
    };
    const ns = videojs as unknown as VjsNamespace;
    const player = ns.getPlayer?.('video_0');

    if (player) {
      const currentTime = player.currentTime?.();
      if (typeof currentTime === 'number' && !Number.isNaN(currentTime)) {
        if (!isActionButonPushed) {
          setStartTime(currentTime);
          setPendingLabel(`${actionName} 記録中`);
        } else {
          const newEndTime = currentTime;
          addTimelineData(actionName, startTime, newEndTime, qualifier);
          setPendingLabel(null);
        }
        setIsActionButtonPushed(!isActionButonPushed);
      }
    }
  };

  return (
    <Button
      sx={{ minWidth: 160 }}
      color={color}
      variant={isActionButonPushed ? 'contained' : 'outlined'}
      onClick={() => addTimeline('')}
    >
      {pendingLabel ? `${pendingLabel}` : `${actionName} 開始`}
    </Button>
  );
};
