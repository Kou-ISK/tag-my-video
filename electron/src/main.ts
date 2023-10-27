import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { Utils, setMainWindow } from './utils';
import { shortCutKeys } from './shortCutKey';
import { menuBar } from './menuBar';

const mainURL = `file:${__dirname}/../../index.html`;

const createWindow = () => {
  let mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  setMainWindow(mainWindow);
  mainWindow.loadURL(mainURL);
  shortCutKeys(mainWindow);
  Menu.setApplicationMenu(menuBar);
};
Utils();

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
