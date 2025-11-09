import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, useMediaQuery, CssBaseline } from '@mui/material';
import { getAppTheme } from './theme';
import { NotificationProvider } from './contexts/NotificationProvider';

/**
 * Root: システムのダークモード設定に完全追従
 */
function Root() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const mode = prefersDark ? 'dark' : 'light';
  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
