import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import * as path from 'path'

const mainURL = `file:${__dirname}/../../index.html`

const createWidnow = () => {
    let mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })
    mainWindow.loadURL(mainURL)

    ipcMain.handle('open-by-button', async () => {
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
            })
            .then((result) => {
                if (result.canceled) return;
                return result.filePaths[0];
            })
            .catch((err) => console.log(`Error: ${err}`));
    });
}

app.whenReady().then(() => {
    createWidnow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWidnow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});