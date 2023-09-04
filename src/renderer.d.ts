export interface IElectronAPI {
    openFile: () => Promise<string>,
    openDirectory: () => Promise<string>,
    exportTimeline: (filePath: string, source: any) => Promise<void>
    createPackage: (directoryName: string, packageName: string, tightViewPath: string, wideViewPath: string, metaDataConfig: any) => Promise<PackageDatas>
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