import { app, BrowserWindow } from 'electron'
import * as path from 'path'

const mainURL = `file:${__dirname}/../../index.html`

const createWidnow = () => {
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })
    mainWindow.loadURL(mainURL)
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