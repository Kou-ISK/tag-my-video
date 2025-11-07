import React from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TimelineData } from '../../../../../types/TimelineData';

interface TimelineLaneProps {
  actionName: string;
  items: TimelineData[];
  selectedIds: string[];
  hoveredItemId: string | null;
  onHoverChange: (id: string | null) => void;
  onItemClick: (event: React.MouseEvent, id: string) => void;
  onItemContextMenu: (event: React.MouseEvent, id: string) => void;
  timeToPosition: (time: number) => number;
  currentTimePosition: number;
  formatTime: (seconds: number) => string;
  firstTeamName: string | undefined;
}

export const TimelineLane: React.FC<TimelineLaneProps> = ({
  actionName,
  items,
  selectedIds,
  hoveredItemId,
  onHoverChange,
  onItemClick,
  onItemContextMenu,
  timeToPosition,
  currentTimePosition,
  formatTime,
  firstTeamName,
}) => {
  const theme = useTheme();
  const teamName = actionName.split(' ')[0];
  const isTeam1 = teamName === firstTeamName;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        position: 'relative',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: isTeam1 ? 'team1.main' : 'team2.main',
          fontWeight: 'bold',
          fontSize: '0.7rem',
          width: 120,
          flexShrink: 0,
          textAlign: 'right',
          pr: 1,
        }}
      >
        {actionName}
      </Typography>

      <Box
        sx={{
          position: 'relative',
          height: 32,
          flex: 1,
          backgroundColor: theme.custom.rails.laneBg,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        {items.map((item) => {
          const left = timeToPosition(item.startTime);
          const width = Math.max(20, timeToPosition(item.endTime) - left);
          const isSelected = selectedIds.includes(item.id);
          const isHovered = hoveredItemId === item.id;

          // バー背景色の決定
          let barBgColor: string;
          if (isSelected) {
            barBgColor = theme.palette.secondary.main;
          } else if (isTeam1) {
            barBgColor = theme.custom.bars.team1;
          } else {
            barBgColor = theme.custom.bars.team2;
          }

          const barOpacity = isHovered ? 1 : isSelected ? 0.9 : 0.7;

          return (
            <Tooltip
              key={item.id}
              title={
                <Stack spacing={0.5}>
                  <Typography variant="caption">{item.actionName}</Typography>
                  <Typography variant="caption">
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </Typography>
                  {item.actionType && (
                    <Typography variant="caption">
                      種別: {item.actionType}
                    </Typography>
                  )}
                  {item.actionResult && (
                    <Typography variant="caption">
                      結果: {item.actionResult}
                    </Typography>
                  )}
                  {item.qualifier && (
                    <Typography variant="caption">
                      備考: {item.qualifier}
                    </Typography>
                  )}
                </Stack>
              }
            >
              <Box
                onClick={(event) => onItemClick(event, item.id)}
                onContextMenu={(event) => onItemContextMenu(event, item.id)}
                onMouseEnter={() => onHoverChange(item.id)}
                onMouseLeave={() => onHoverChange(null)}
                sx={{
                  position: 'absolute',
                  left: `${left}px`,
                  width: `${width}px`,
                  top: 4,
                  bottom: 4,
                  backgroundColor: barBgColor,
                  opacity: barOpacity,
                  borderRadius: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 0.5,
                  border: isSelected ? 2 : 0,
                  borderColor: isSelected
                    ? theme.custom.bars.selectedBorder
                    : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scaleY(1.2)',
                    zIndex: 5,
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatTime(item.startTime)}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}

        <Box
          sx={{
            position: 'absolute',
            left: `${currentTimePosition}%`,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: 'error.main',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      </Box>
    </Box>
  );
};
