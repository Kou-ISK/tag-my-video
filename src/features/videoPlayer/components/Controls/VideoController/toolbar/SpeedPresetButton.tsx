import React from 'react';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SpeedPresetButtonProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  playbackRate: number;
  disabled: boolean;
  flashing: boolean;
  onSelect: (value: number) => void;
  onTriggerFlash: (key: string) => void;
}

export const SpeedPresetButton: React.FC<SpeedPresetButtonProps> = ({
  label,
  value,
  icon,
  playbackRate,
  disabled,
  flashing,
  onSelect,
  onTriggerFlash,
}) => {
  const theme = useTheme();
  const key = `speed-${value}`;
  const isActive = Math.abs(playbackRate - value) < 0.0001;
  const lit = isActive || flashing;

  return (
    <Tooltip title={`${label}で再生`}>
      <span>
        <IconButton
          aria-label={`${label}で再生`}
          aria-pressed={isActive}
          onClick={() => {
            if (disabled) return;
            onSelect(value);
            onTriggerFlash(key);
          }}
          disabled={disabled}
          sx={{
            ...theme.custom.controllerPresetButton,
            bgcolor: lit ? 'primary.main' : theme.custom.glass.hover,
            '&:hover': {
              bgcolor: lit ? 'primary.dark' : theme.custom.glass.hoverStrong,
            },
            color: lit ? 'primary.contrastText' : 'text.secondary',
            minWidth: 40,
            gap: 0.25,
          }}
          size="small"
        >
          {icon}
          <Typography
            variant="caption"
            sx={{ lineHeight: 1, color: 'inherit', fontWeight: 'bold' }}
          >
            {label}
          </Typography>
        </IconButton>
      </span>
    </Tooltip>
  );
};
