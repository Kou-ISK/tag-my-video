import { BrowserWindow, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import { PackageDatas } from '../../src/renderer';

// メインプロセスで使用するメソッドを切り出し

let mainWindow: Electron.BrowserWindow | null = null; // mainWindowをnullで初期化

export const setMainWindow = (window: Electron.BrowserWindow) => {
  mainWindow = window;
};

export const Utils = () => {
  ipcMain.handle('open-directory', async () => {
    return dialog
      .showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        message: 'パッケージを選択する',
        filters: [
          {
            name: 'パッケージファイル',
            extensions: ['pkg'],
          },
        ],
      })
      .then((result) => {
        if (result.canceled) return;
        return result.filePaths[0];
      })
      .catch((err) => console.log(`Error: ${err}`));
  });

  ipcMain.handle('open-file', async () => {
    return dialog
      .showOpenDialog(mainWindow, {
        properties: ['openFile'],
        message: 'ファイルを選択する',
        filters: [
          {
            name: '映像ファイル',
            extensions: ['mov', 'mp4'],
          },
        ],
      })
      .then((result) => {
        if (result.canceled) return;
        return result.filePaths[0];
      })
      .catch((err) => console.log(`Error: ${err}`));
  });

  ipcMain.handle('export-timeline', async (_, filePath, source) => {
    const toJSON = JSON.stringify(source);
    fs.writeFile(filePath, toJSON, (error) => {
      console.log(error);
    });
  });

  ipcMain.handle(
    'create-package',
    async (
      _,
      directoryName,
      packageName,
      tightViewPath,
      wideViewPath,
      metaDataConfig,
    ) => {
      // 引数で取ったpackageNameをもとに新規パッケージを作成
      const newPackagePath = directoryName + '/' + packageName;
      const newFilePath = newPackagePath.substring(
        newPackagePath.lastIndexOf('/') + 1,
      );
      fs.mkdirSync(newPackagePath);
      // .metadataファイルを作成
      fs.mkdirSync(newPackagePath + '/.metadata');
      const metaDataText = JSON.stringify(metaDataConfig);
      console.log(metaDataConfig);
      console.log(metaDataText);
      fs.writeFile(
        newPackagePath + '/.metadata/config.json',
        metaDataText,
        (err) => {
          if (err) console.log(err);
        },
      );
      fs.mkdirSync(newPackagePath + '/videos');
      // 新しいビデオファイルパスを変数に格納
      const newTightViewPath =
        newPackagePath + '/videos/' + newFilePath + ' 寄り.mp4';
      const newWideViewPath =
        newPackagePath + '/videos/' + newFilePath + ' 引き.mp4';
      fs.renameSync(tightViewPath, newTightViewPath);
      fs.renameSync(wideViewPath, newWideViewPath);
      // タイムラインファイルを作成
      fs.writeFile(newPackagePath + '/timeline.json', '[]', (err) => {
        if (err) console.log(err);
      });
      /* 
        PackageName.pkg
        ┗ .metadata
            ┗ config.json (チーム名、シンク機能実装後は各ビデオアングルの開始秒数など)
        ┗ timeline.json
        ┗ videos
            ┗ tightView.mp4
            ┗ wideView.mp4
        */
      const packageDatas: PackageDatas = {
        timelinePath: newPackagePath + '/timeline.json',
        tightViewPath: newTightViewPath,
        wideViewPath: newWideViewPath,
        metaDataConfigFilePath: newPackagePath + '/.metadata/config.json',
      };
      console.log(packageDatas);
      return packageDatas;
    },
  );
};
