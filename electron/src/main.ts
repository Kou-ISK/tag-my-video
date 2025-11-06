import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { Utils, setMainWindow } from './utils';
import { shortCutKeys } from './shortCutKey';
import { menuBar } from './menuBar';

// ローカル動画の自動再生を許可
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const mainURL = `file:${__dirname}/../../index.html`;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // ローカル file:// リソースを許可（開発用）
      webSecurity: false,
      // セキュリティ: Preloadスクリプトからのみブリッジする
      contextIsolation: true,
      // Electron 31対応: sandboxは無効化（レガシー動作を維持）
      sandbox: false,
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
