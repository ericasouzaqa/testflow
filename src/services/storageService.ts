declare global {
  interface Window {
    testflow?: {
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
    };
  }
}

const hasElectron = () => typeof window !== "undefined" && !!window.testflow;

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  if (hasElectron()) {
    const data = await window.testflow!.readData(fileName);
    return (data ?? fallback) as T;
  }
  const raw = localStorage.getItem(`testflow:${fileName}`);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

async function writeJson<T>(fileName: string, content: T): Promise<void> {
  if (hasElectron()) {
    await window.testflow!.writeData(fileName, content);
    return;
  }
  localStorage.setItem(`testflow:${fileName}`, JSON.stringify(content));
}

async function openFileDialog(
  filters: { name: string; extensions: string[] }[]
): Promise<{ fileName: string; content: string } | null> {
  if (hasElectron()) {
    const result = await window.testflow!.openFile(filters);
    if (!result) return null;
    const fileName = result.filePath.split(/[\\/]/).pop() || "arquivo";
    return { fileName, content: result.content };
  }
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = filters
      .flatMap((f) => f.extensions.map((e) => `.${e}`))
      .join(",");
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ fileName: file.name, content: reader.result as string });
      reader.readAsText(file);
    };
    input.click();
  });
}

async function saveTextFile(
  defaultName: string,
  content: string,
  filters: { name: string; extensions: string[] }[]
): Promise<void> {
  if (hasElectron()) {
    const filePath = await window.testflow!.saveFile(defaultName, filters);
    if (!filePath) return;
    await window.testflow!.writeText(filePath, content);
    return;
  }
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, defaultName);
}

async function saveBinaryFile(
  defaultName: string,
  base64Data: string,
  filters: { name: string; extensions: string[] }[]
): Promise<void> {
  if (hasElectron()) {
    const filePath = await window.testflow!.saveFile(defaultName, filters);
    if (!filePath) return;
    await window.testflow!.writeBuffer(filePath, base64Data);
    return;
  }
  const byteChars = atob(base64Data);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([new Uint8Array(byteNumbers)]);
  downloadBlob(blob, defaultName);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const storageService = {
  readJson,
  writeJson,
  openFileDialog,
  saveTextFile,
  saveBinaryFile,
};
