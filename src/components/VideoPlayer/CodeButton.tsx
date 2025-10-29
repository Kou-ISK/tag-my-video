import { Button } from '@mui/material';
import { useState } from 'react';
import videojs from 'video.js';
import React from 'react';

interface CodeButtonProps {
  actionName: string;
  displayName?: string; // ボタンに表示するテキスト（省略時はactionName）
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
  displayName,
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

  const getButtonLabel = () => {
    if (pendingLabel) return '記録中...';
    return displayName ?? `${actionName} 開始`;
  };

  return (
    <Button
      sx={{
        minWidth: { xs: '100%', sm: 140, md: 160 },
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
      }}
      color={color}
      variant={isActionButonPushed ? 'contained' : 'outlined'}
      onClick={() => addTimeline('')}
    >
      {getButtonLabel()}
    </Button>
  );
};
