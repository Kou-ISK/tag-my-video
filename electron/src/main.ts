import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

const mainURL = `file:${__dirname}/../../index.html`;

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.ts"),
        },
    });

    mainWindow.loadURL(mainURL);

    ipcMain.handle('open-by-button', async () => {
        try {
            const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile'],
                title: 'ファイルを選択する',
                filters: [
                    {
                        name: '画像ファイル',
                        extensions: ['png', 'jpeg', 'jpg'],
                    },
                ],
            });

            if (result.canceled) return;
            return result.filePaths[0];
        } catch (err) {
            console.log(`Error: ${err}`);
        }
    });

    ipcMain.handle('export-timeline', async (_, filePath, source) => {
        try {
            const toJSON = JSON.stringify(source);
            await fs.writeFile(filePath, toJSON);
            console.log('JSONファイルを生成しました');
        } catch (err) {
            console.error('Error writing JSON file:', err);
        }
    });

    ipcMain.handle('create-package', async () => {
        /* 
        TODO Tight, Wideのファイルパスを指定すると下記構成のパッケージを作成する
    
        PackageName.pkg
        ┗ .metadata
            ┗ config.json (チーム名、シンク機能実装後は各ビデオアングルの開始秒数など)
        ┗ timeline.json
        ┗ videos
            ┗ video0
                ┗ tightView.mp4
            ┗ video1
                ┗ wideView.mp4
        */
    })
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
