export interface IElectronAPI {
    version: () => string
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}