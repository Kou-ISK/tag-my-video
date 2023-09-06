import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { Utils } from './utils'


const mainURL = `file:${__dirname}/../../index.html`

const createWidnow = () => {
    let mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })
    mainWindow.loadURL(mainURL)
    Utils(mainWindow)
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