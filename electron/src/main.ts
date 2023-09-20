import { app, BrowserWindow, Menu } from 'electron'
import * as path from 'path'
import { Utils } from './utils'
import { shortCutKeys } from './shortCutKey'
import { menuBar } from './menuBar'


const mainURL = `file:${__dirname}/../../index.html`

const createWidnow = () => {
    let mainWindow = new BrowserWindow({
        width: 1400,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })
    mainWindow.loadURL(mainURL)
    Utils(mainWindow)
    shortCutKeys(mainWindow)
    Menu.setApplicationMenu(menuBar)
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