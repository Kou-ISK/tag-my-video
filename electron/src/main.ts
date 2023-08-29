import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

const mainURL = `file:${__dirname}/../../index.html`;

const createWidnow = () => {
    let mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,

        webPreferences: {
            preload: path.join(__dirname, "preload.ts"),
        },
    });

    mainWindow.loadURL(mainURL);


    ipcMain.handle('open-directory', async () => {
        return dialog
            .showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
                title: 'パッケージを選択する',
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
        const toJSON = JSON.stringify(source);
        fs.writeFile(filePath, toJSON, (error) => { console.log(error) });
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
