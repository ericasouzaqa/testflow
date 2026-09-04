export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface PostmanRequestItem {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  bodyMode?: "raw" | "form-data" | "none";
}

export interface Collection {
  id: string;
  name: string;
  fileName: string;
  importedAt: string;
  requests: PostmanRequestItem[];
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface CsvDataset {
  id: string;
  fileName: string;
  importedAt: string;
  headers: string[];
  rows: Record<string, string>[];
}

export type ExecutionStatus = "success" | "failure" | "skipped";

export interface ExecutionResult {
  id: string;
  rowIndex: number;
  requestId: string;
  requestName: string;
  method: HttpMethod;
  url: string;
  status: ExecutionStatus;
  statusCode?: number;
  timeMs: number;
  error?: string;
  retriedAuth?: boolean;
  timestamp: string;
}

export interface HistoryEntry {
  id: string;
  collectionName: string;
  environmentName: string;
  csvFileName: string;
  startedAt: string;
  finishedAt: string;
  totalRequests: number;
  successCount: number;
  failureCount: number;
  results: ExecutionResult[];
}

export interface AuthConfig {
  enabled: boolean;
  loginUrl: string;
  method: HttpMethod;
  headers: Record<string, string>;
  bodyTemplate: string;
  tokenResponsePath: string;
  tokenVariableName: string;
  authHeaderName: string;
  authHeaderPrefix: string;
}

export interface AppSettings {
  continueOnFailure: boolean;
  requestDelayMs: number;
  timeoutMs: number;
  authConfig: AuthConfig | null;
}

export interface RunProgress {
  running: boolean;
  currentRow: number;
  totalRows: number;
  currentRequestName: string;
  successCount: number;
  failureCount: number;
  logs: ExecutionResult[];
}
