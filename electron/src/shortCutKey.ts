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
  globalShortcut.register('Command+Option+1', () =>
    mainWindow.webContents.send('menu-show-stats', 'possession'),
  );
  globalShortcut.register('Command+Option+2', () =>
    mainWindow.webContents.send('menu-show-stats', 'results'),
  );
  globalShortcut.register('Command+Option+3', () =>
    mainWindow.webContents.send('menu-show-stats', 'types'),
  );
  globalShortcut.register('Command+Option+4', () =>
    mainWindow.webContents.send('menu-show-stats', 'momentum'),
  );
  globalShortcut.register('Command+Option+5', () =>
    mainWindow.webContents.send('menu-show-stats', 'matrix'),
  );

  globalShortcut.register('Command+Z', () =>
    mainWindow.webContents.send('timeline-undo'),
  );

  globalShortcut.register('Command+Shift+Z', () =>
    mainWindow.webContents.send('timeline-redo'),
  );
};
