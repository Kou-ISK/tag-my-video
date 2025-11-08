import React from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import KeyboardIcon from '@mui/icons-material/Keyboard';

interface QuickHelpFabProps {
  onClick: () => void;
}

export const QuickHelpFab: React.FC<QuickHelpFabProps> = ({ onClick }) => {
  return (
    <Zoom in timeout={300}>
      <Tooltip title="ショートカット一覧 (Command + /)" placement="left" arrow>
        <Fab
          color="primary"
          onClick={onClick}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: (theme) => theme.zIndex.speedDial,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(30, 144, 255, 0.3)'
                : '0 8px 32px rgba(30, 144, 255, 0.2)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(30, 144, 255, 0.4)'
                  : '0 12px 40px rgba(30, 144, 255, 0.3)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <KeyboardIcon />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};
