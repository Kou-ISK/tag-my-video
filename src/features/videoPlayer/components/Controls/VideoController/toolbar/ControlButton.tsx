import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ControlButtonProps {
  title: string;
  icon: React.ReactNode;
  actionKey: string;
  disabled: boolean;
  flashing: boolean;
  active?: boolean;
  emphasize?: boolean;
  onClick: () => void;
  onTriggerFlash: (key: string) => void;
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  title,
  icon,
  actionKey,
  disabled,
  flashing,
  active,
  emphasize,
  onClick,
  onTriggerFlash,
}) => {
  const theme = useTheme();
  const isActive = !!active || flashing;
  const baseBg = emphasize ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)';
  const hoverBg = emphasize
    ? 'rgba(255,255,255,0.28)'
    : 'rgba(255,255,255,0.24)';
  const activeBg = emphasize ? 'primary.main' : 'rgba(255,255,255,0.32)';
  const activeHoverBg = emphasize ? 'primary.dark' : 'rgba(255,255,255,0.4)';

  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          onClick={() => {
            if (disabled) return;
            onClick();
            onTriggerFlash(actionKey);
          }}
          disabled={disabled}
          sx={{
            ...theme.custom.controllerButton,
            bgcolor: isActive ? activeBg : baseBg,
            '&:hover': {
              bgcolor: isActive ? activeHoverBg : hoverBg,
            },
            boxShadow: flashing ? '0 0 0 2px rgba(255,255,255,0.4)' : undefined,
          }}
          size="large"
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};
