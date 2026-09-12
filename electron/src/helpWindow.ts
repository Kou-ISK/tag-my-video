import { BrowserWindow, app } from 'electron';
import { createSemanticTokens } from '../../src/design-system/tokens/semantic';
import { applyWindowSecurity } from './windowSecurity';
import { buildHelpHtml } from './helpDocument';

let helpWindow: BrowserWindow | null = null;

export const openHelpWindow = (): void => {
  if (helpWindow && !helpWindow.isDestroyed()) {
    helpWindow.focus();
    return;
  }

  helpWindow = new BrowserWindow({
    width: 980,
    height: 760,
    minWidth: 620,
    minHeight: 480,
    autoHideMenuBar: true,
    backgroundColor: createSemanticTokens('dark').surface.canvas,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });
  applyWindowSecurity(helpWindow);

  helpWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(buildHelpHtml())}`,
  );
  helpWindow.on('closed', () => {
    helpWindow = null;
  });
};

if (app?.on) {
  app.on('window-all-closed', () => {
    helpWindow = null;
  });
}
