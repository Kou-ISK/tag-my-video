import { contextBridge } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
    version: () => "1.0.0",
})