export interface IElectronAPI {
    openFile: () => Promise<string>,
    openDirectory: () => Promise<string>,
    exportTimeline: (filePath: string, source: any) => Promise<void>
    createPackage: (directoryName: string, packageName: string, tightViewPath: string, wideViewPath: string, metaDataConfig: any) => Promise<PackageDatas>
    on: (channel: string, listener: (event: any, args: number) => void) => void
}

export interface PackageDatas {
    timelinePath: string,
    tightViewPath: string,
    wideViewPath: string,
    metaDataConfigFilePath: string
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}