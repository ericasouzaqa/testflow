import * as XLSX from "xlsx";
import type { ExecutionResult } from "@/types";
import { resultsToCsv } from "./csvService";
import { storageService } from "./storageService";

function buildRows(results: ExecutionResult[]) {
  return results.map((r) => ({
    "Linha CSV": r.rowIndex + 1,
    Requisicao: r.requestName,
    Metodo: r.method,
    URL: r.url,
    Status: r.status,
    "Codigo HTTP": r.statusCode ?? "",
    "Tempo (ms)": r.timeMs,
    Reautenticado: r.retriedAuth ? "Sim" : "Nao",
    Erro: r.error ?? "",
    "Data/Hora": r.timestamp,
  }));
}

export async function exportResultsAsCsv(
  results: ExecutionResult[],
  fileName = "resultado.csv"
) {
  const csv = resultsToCsv(results);
  await storageService.saveTextFile(fileName, csv, [
    { name: "CSV", extensions: ["csv"] },
  ]);
}

export async function exportResultsAsXlsx(
  results: ExecutionResult[],
  fileName = "resultado.xlsx"
) {
  const rows = buildRows(results);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");

  const arrayBuffer = XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
  }) as ArrayBuffer;

  const base64 = arrayBufferToBase64(arrayBuffer);
  await storageService.saveBinaryFile(fileName, base64, [
    { name: "Excel", extensions: ["xlsx"] },
  ]);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}
