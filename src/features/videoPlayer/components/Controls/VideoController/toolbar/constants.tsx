import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import SpeedIcon from '@mui/icons-material/Speed';
import React from 'react';

export const SPEED_PRESETS: Array<{
  label: string;
  value: number;
  icon: React.ReactNode;
}> = [
  {
    label: '0.5x',
    value: 0.5,
    icon: <SlowMotionVideoIcon fontSize="small" />,
  },
  {
    label: '2x',
    value: 2,
    icon: <SpeedIcon fontSize="small" />,
  },
  {
    label: '4x',
    value: 4,
    icon: <SpeedIcon fontSize="small" />,
  },
  {
    label: '6x',
    value: 6,
    icon: <SpeedIcon fontSize="small" />,
  },
];
