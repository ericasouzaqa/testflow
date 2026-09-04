import Papa from "papaparse";
import { v4 as uuid } from "uuid";
import type { CsvDataset, ExecutionResult } from "@/types";

export function parseCsv(fileName: string, rawCsv: string): CsvDataset {
  const parsed = Papa.parse<Record<string, string>>(rawCsv, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = parsed.meta.fields || [];
  const rows = parsed.data.filter((row) =>
    Object.values(row).some((v) => v !== undefined && v !== "")
  );

  return {
    id: uuid(),
    fileName,
    importedAt: new Date().toISOString(),
    headers,
    rows,
  };
}

export function resultsToCsv(results: ExecutionResult[]): string {
  const rows = results.map((r) => ({
    linha_csv: r.rowIndex + 1,
    requisicao: r.requestName,
    metodo: r.method,
    url: r.url,
    status: r.status,
    codigo_http: r.statusCode ?? "",
    tempo_ms: r.timeMs,
    reautenticado: r.retriedAuth ? "sim" : "nao",
    erro: r.error ?? "",
    data_hora: r.timestamp,
  }));
  return Papa.unparse(rows);
}
