import { createContext, useContext } from 'react';

export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  message: string;
  severity?: NotificationSeverity;
  duration?: number;
}

export interface NotificationContextValue {
  notify: (options: NotificationOptions) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const NotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined);

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
