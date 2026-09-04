import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function getDataDir(): string {
  const dir = isDev
    ? path.join(__dirname, "..", "data")
    : path.join(process.resourcesPath, "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function ensureDataFile(fileName: string, defaultContent: unknown) {
  const filePath = path.join(getDataDir(), fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2), "utf-8");
  }
  return filePath;
}

function initDataFiles() {
  ensureDataFile("collections.json", []);
  ensureDataFile("environments.json", []);
  ensureDataFile("history.json", []);
  ensureDataFile(
    "settings.json",
    {
      continueOnFailure: true,
      requestDelayMs: 0,
      timeoutMs: 15000,
      authConfig: null,
    }
  );
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#050510",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  initDataFiles();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---------- IPC: persistência JSON ----------

ipcMain.handle("data:read", (_e, fileName: string) => {
  const filePath = path.join(getDataDir(), fileName);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
});

ipcMain.handle("data:write", (_e, fileName: string, content: unknown) => {
  const filePath = path.join(getDataDir(), fileName);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
  return true;
});

// ---------- IPC: diálogos de arquivo ----------

ipcMain.handle("dialog:openFile", async (_e, filters: Electron.FileFilter[]) => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters,
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, "utf-8");
  return { filePath, content };
});

ipcMain.handle(
  "dialog:saveFile",
  async (_e, defaultName: string, filters: Electron.FileFilter[]) => {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters,
    });
    if (result.canceled || !result.filePath) return null;
    return result.filePath;
  }
);

ipcMain.handle(
  "file:writeBuffer",
  async (_e, filePath: string, base64Data: string) => {
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(filePath, buffer);
    return true;
  }
);

ipcMain.handle("file:writeText", async (_e, filePath: string, text: string) => {
  fs.writeFileSync(filePath, text, "utf-8");
  return true;
});
