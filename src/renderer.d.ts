export interface IElectronAPI {
    openFile: () => Promise<string>,
    openDirectory: () => Promise<string>,
    exportTimeline: (filePath: string, source: any) => Promise<void>
    createPackage: (directoryName: string, packageName: string, tightViewPath: string, wideViewPath: string) => Promise<PackageDatas>
}

export type PackageDatas = {
    timelinePath: string,
    tightViewPath: string,
    wideViewPath: string
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}