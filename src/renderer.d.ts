export interface IElectronAPI {
    openFile: () => Promise<string>,
    openDirectory: () => Promise<string>,
    exportTimeline: (filePath: string, source: any) => Promise<void>
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}