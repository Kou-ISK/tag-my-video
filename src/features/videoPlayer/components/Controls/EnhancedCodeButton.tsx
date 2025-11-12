import React from 'react';
import { Button, alpha } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface EnhancedCodeButtonProps {
  label: string;
  isSelected: boolean;
  isDisabled?: boolean;
  color?: 'team1' | 'team2' | 'primary' | 'secondary';
  onClick: () => void;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

/**
 * 選択状態・無効状態を視覚的に表現するコードボタン
 */
export const EnhancedCodeButton: React.FC<EnhancedCodeButtonProps> = ({
  label,
  isSelected,
  isDisabled = false,
  color = 'primary',
  onClick,
  size = 'medium',
  fullWidth = true,
}) => {
  const buttonHeight = size === 'small' ? 32 : 40;
  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';

  return (
    <Button
      variant={isSelected ? 'contained' : 'outlined'}
      color={color}
      disabled={isDisabled}
      onClick={onClick}
      fullWidth={fullWidth}
      endIcon={isSelected ? <CheckCircleIcon fontSize="small" /> : undefined}
      sx={{
        minHeight: buttonHeight,
        fontSize,
        py: 0.75,
        px: 1.5,
        fontWeight: isSelected ? 'bold' : 'normal',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        ...(isSelected && {
          boxShadow: (theme) =>
            `0 0 0 2px ${alpha(theme.palette[color].main, 0.3)}`,
        }),
        ...(isDisabled && {
          opacity: 0.4,
          pointerEvents: 'none',
        }),
        '&:hover': {
          transform: isDisabled ? 'none' : 'translateY(-1px)',
          boxShadow: (theme) =>
            isDisabled
              ? 'none'
              : `0 4px 8px ${alpha(theme.palette[color].main, 0.25)}`,
        },
      }}
    >
      {label}
    </Button>
  );
};
