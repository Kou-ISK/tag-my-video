import local_shortcut = require("electron-localshortcut");

export const shortCutKeys = (mainWindow) => {
    local_shortcut.register(mainWindow, "Right", () =>
        mainWindow.webContents.send("video-shortcut-event", 0.5)
    );

    local_shortcut.register(mainWindow, "Shift+Right", () =>
        mainWindow.webContents.send("video-shortcut-event", 2)
    );

    local_shortcut.register(mainWindow, "Command+Right", () =>
        mainWindow.webContents.send("video-shortcut-event", 4)
    );

    local_shortcut.register(mainWindow, "Option+Right", () =>
        mainWindow.webContents.send("video-shortcut-event", 6)
    );

    local_shortcut.register(mainWindow, "Up", () =>
        mainWindow.webContents.send("video-shortcut-event", 1)
    );

    local_shortcut.register(mainWindow, "Left", () =>
        mainWindow.webContents.send("video-shortcut-event", -5)
    );
    local_shortcut.register(mainWindow, "Shift+Left", () =>
        mainWindow.webContents.send("video-shortcut-event", -10)
    );

    local_shortcut.register(mainWindow, "Command+Shift+A", () =>
        mainWindow.webContents.send("general-shortcut-event", 'analyze')
    );
}