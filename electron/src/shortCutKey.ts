import { BrowserWindow, globalShortcut } from 'electron';

export const shortCutKeys = (mainWindow: BrowserWindow) => {
  globalShortcut.register('Right', () =>
    mainWindow.webContents.send('video-shortcut-event', 0.5),
  );

  globalShortcut.register('Shift+Right', () =>
    mainWindow.webContents.send('video-shortcut-event', 2),
  );

  globalShortcut.register('Command+Right', () =>
    mainWindow.webContents.send('video-shortcut-event', 4),
  );

  globalShortcut.register('Option+Right', () =>
    mainWindow.webContents.send('video-shortcut-event', 6),
  );

  globalShortcut.register('Up', () =>
    mainWindow.webContents.send('video-shortcut-event', 1),
  );

  globalShortcut.register('Left', () =>
    mainWindow.webContents.send('video-shortcut-event', -5),
  );
  globalShortcut.register('Shift+Left', () =>
    mainWindow.webContents.send('video-shortcut-event', -10),
  );

  globalShortcut.register('Command+Shift+A', () =>
    mainWindow.webContents.send('general-shortcut-event', 'analyze'),
  );
  globalShortcut.register('Command+Shift+1', () =>
    mainWindow.webContents.send('menu-show-stats', 'possession'),
  );
  globalShortcut.register('Command+Shift+2', () =>
    mainWindow.webContents.send('menu-show-stats', 'results'),
  );
  globalShortcut.register('Command+Shift+3', () =>
    mainWindow.webContents.send('menu-show-stats', 'types'),
  );
  globalShortcut.register('Command+Shift+4', () =>
    mainWindow.webContents.send('menu-show-stats', 'momentum'),
  );
  globalShortcut.register('Command+Shift+5', () =>
    mainWindow.webContents.send('menu-show-stats', 'matrix'),
  );
};
