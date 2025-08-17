import { BrowserWindow, dialog, ipcMain, Menu } from 'electron';
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
      fs.mkdirSync(newPackagePath + '/videos');
      // 新しいビデオファイルパスを変数に格納
      const newTightViewPath =
        newPackagePath + '/videos/' + newFilePath + ' 寄り.mp4';
      fs.renameSync(tightViewPath, newTightViewPath);
      // wideViewPathが存在する場合のみ書き出し
      let newWideViewPath = null;
      if (wideViewPath) {
        newWideViewPath =
          newPackagePath + '/videos/' + newFilePath + ' 引き.mp4';
        fs.renameSync(wideViewPath, newWideViewPath);
      }
      // タイムラインファイルを作成
      fs.writeFile(newPackagePath + '/timeline.json', '[]', (err) => {
        if (err) console.log(err);
      });
      // .metadataファイルを作成
      fs.mkdirSync(newPackagePath + '/.metadata');
      metaDataConfig.tightViewPath = newTightViewPath;
      metaDataConfig.wideViewPath = newWideViewPath;
      const metaDataText = JSON.stringify(metaDataConfig);
      console.log(metaDataConfig);
      fs.writeFile(
        newPackagePath + '/.metadata/config.json',
        metaDataText,
        (err) => {
          if (err) console.log(err);
        },
      );
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

  // ファイル存在確認ハンドラーを追加
  ipcMain.handle('check-file-exists', async (event, filePath: string) => {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      console.log(`ファイル存在確認: ${filePath} - 存在します`);
      return true;
    } catch (error) {
      console.log(`ファイル存在確認: ${filePath} - 存在しません`, error);
      return false;
    }
  });

  // 同期データを保存
  ipcMain.handle(
    'save-sync-data',
    async (
      _event,
      configPath: string,
      syncData: {
        syncOffset: number;
        isAnalyzed: boolean;
        confidenceScore?: number;
      },
    ) => {
      try {
        const raw = await fs.promises.readFile(configPath, 'utf-8');
        const json = JSON.parse(raw || '{}');
        json.syncData = {
          syncOffset: Number(syncData?.syncOffset) || 0,
          isAnalyzed: !!syncData?.isAnalyzed,
          confidenceScore:
            typeof syncData?.confidenceScore === 'number'
              ? syncData.confidenceScore
              : undefined,
        };
        await fs.promises.writeFile(
          configPath,
          JSON.stringify(json, null, 2),
          'utf-8',
        );
        return true;
      } catch (e) {
        console.error('save-sync-data error:', e);
        return false;
      }
    },
  );

  ipcMain.handle('set-manual-mode-checked', async (_, checked: boolean) => {
    try {
      const menu = Menu.getApplicationMenu();
      const item = menu?.getMenuItemById('toggle-manual-mode');
      if (item) {
        item.checked = checked;
      }
      console.log(`手動モードが${checked ? 'オン' : 'オフ'}になりました`);
      return true;
    } catch (error) {
      console.error('set-manual-mode-checked error:', error);
      return false;
    }
  });
};
