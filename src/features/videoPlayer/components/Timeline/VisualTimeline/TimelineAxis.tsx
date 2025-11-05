import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TimelineAxisProps {
  containerRef: React.RefObject<HTMLDivElement>;
  maxSec: number;
  currentTimePosition: number;
  timeMarkers: number[];
  onSeek: (event: React.MouseEvent<HTMLDivElement>) => void;
  formatTime: (seconds: number) => string;
}

export const TimelineAxis: React.FC<TimelineAxisProps> = ({
  containerRef,
  maxSec,
  currentTimePosition,
  timeMarkers,
  onSeek,
  formatTime,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2,
      }}
    >
      <Box sx={{ width: 120, flexShrink: 0 }} />

      <Box
        ref={containerRef}
        onClick={onSeek}
        sx={{
          position: 'relative',
          flex: 1,
          height: 40,
          backgroundColor:
            theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
          },
        }}
      >
        {timeMarkers.map((time) => (
          <Box
            key={time}
            sx={{
              position: 'absolute',
              left: `${(time / maxSec) * 100}%`,
              top: 0,
              bottom: 0,
              borderLeft: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'flex-end',
              pb: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                transform: 'translateX(-50%)',
                color: 'text.secondary',
              }}
            >
              {formatTime(time)}
            </Typography>
          </Box>
        ))}

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
        >
          <Box
            sx={{
              position: 'absolute',
              top: -6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${theme.palette.error.main}`,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
