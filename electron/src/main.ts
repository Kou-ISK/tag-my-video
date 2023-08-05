import { app, BrowserWindow } from 'electron'
import isDev = require('electron-is-dev')
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
    if (isDev) {
        mainWindow.loadURL("http://localhost:3000/index.html")
    } else {
        mainWindow.loadURL(mainURL)
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    if (isDev) {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/../node_modules/electron`)
        });
    }
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