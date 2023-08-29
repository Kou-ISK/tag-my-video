import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
    // we can also expose variables, not just functions
});

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: async () => {
        try {
            const filePath = await ipcRenderer.invoke('open-file');
            return filePath;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    },
    openDirectory: async () => {
        try {
            const filePath = await ipcRenderer.invoke('open-directory');
            return filePath;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    },
    exportTimeline: async (filePath: string, source: any) => {
        try {
            await ipcRenderer.invoke('export-timeline', filePath, source);
            console.log('Timeline exported successfully.');
        } catch (error) {
            console.error('Error exporting timeline:', error);
        }
    }
});