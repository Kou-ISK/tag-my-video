import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
    // we can also expose variables, not just functions
});

contextBridge.exposeInMainWorld('electronAPI', {
    openFileDialog: async () => {
        return ipcRenderer.invoke('open-by-button');
    },
    exportTimeline: async (filePath: string, source: any) => {
        return ipcRenderer.invoke('export-timeline', filePath, source);
    }
});