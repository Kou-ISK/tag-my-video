import React, { useState, useCallback, useMemo } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import {
  NotificationContext,
  NotificationContextValue,
  NotificationOptions,
} from './NotificationContext';

interface NotificationState extends NotificationOptions {
  open: boolean;
  key: number;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
    duration: 4000,
    key: 0,
  });

  const notify = useCallback((options: NotificationOptions) => {
    setNotification((prev) => ({
      open: true,
      message: options.message,
      severity: options.severity || 'info',
      duration: options.duration || 4000,
      key: prev.key + 1,
    }));
  }, []);

  const success = useCallback(
    (message: string, duration = 4000) => {
      notify({ message, severity: 'success', duration });
    },
    [notify],
  );

  const error = useCallback(
    (message: string, duration = 6000) => {
      notify({ message, severity: 'error', duration });
    },
    [notify],
  );

  const warning = useCallback(
    (message: string, duration = 5000) => {
      notify({ message, severity: 'warning', duration });
    },
    [notify],
  );

  const info = useCallback(
    (message: string, duration = 4000) => {
      notify({ message, severity: 'info', duration });
    },
    [notify],
  );

  const handleClose = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setNotification((prev) => ({ ...prev, open: false }));
    },
    [],
  );

  const contextValue = useMemo<NotificationContextValue>(
    () => ({
      notify,
      success,
      error,
      warning,
      info,
    }),
    [notify, success, error, warning, info],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Snackbar
        key={notification.key}
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.severity as AlertColor}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
