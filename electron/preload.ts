import { contextBridge, ipcRenderer } from "electron";

export interface TestflowAPI {
  readData: (fileName: string) => Promise<any>;
  writeData: (fileName: string, content: unknown) => Promise<boolean>;
  openFile: (
    filters: { name: string; extensions: string[] }[]
  ) => Promise<{ filePath: string; content: string } | null>;
  saveFile: (
    defaultName: string,
    filters: { name: string; extensions: string[] }[]
  ) => Promise<string | null>;
  writeBuffer: (filePath: string, base64Data: string) => Promise<boolean>;
  writeText: (filePath: string, text: string) => Promise<boolean>;
}

const api: TestflowAPI = {
  readData: (fileName) => ipcRenderer.invoke("data:read", fileName),
  writeData: (fileName, content) =>
    ipcRenderer.invoke("data:write", fileName, content),
  openFile: (filters) => ipcRenderer.invoke("dialog:openFile", filters),
  saveFile: (defaultName, filters) =>
    ipcRenderer.invoke("dialog:saveFile", defaultName, filters),
  writeBuffer: (filePath, base64Data) =>
    ipcRenderer.invoke("file:writeBuffer", filePath, base64Data),
  writeText: (filePath, text) =>
    ipcRenderer.invoke("file:writeText", filePath, text),
};

contextBridge.exposeInMainWorld("testflow", api);
