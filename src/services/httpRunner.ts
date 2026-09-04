import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuid } from "uuid";
import type {
  AuthConfig,
  Collection,
  CsvDataset,
  Environment,
  ExecutionResult,
  AppSettings,
  PostmanRequestItem,
} from "@/types";
import {
  substituteInHeaders,
  substituteVariables,
  getByPath,
} from "@/utils/variables";

export interface RunnerCallbacks {
  onResult: (result: ExecutionResult) => void;
  onProgress: (currentRow: number, totalRows: number, requestName: string) => void;
  isCancelled: () => boolean;
}

async function executeSingleRequest(
  req: PostmanRequestItem,
  variables: Record<string, string>,
  timeoutMs: number
) {
  const url = substituteVariables(req.url, variables);
  const headers = substituteInHeaders(req.headers, variables);
  const body =
    req.body && req.bodyMode === "raw"
      ? substituteVariables(req.body, variables)
      : req.body;

  const config: AxiosRequestConfig = {
    method: req.method,
    url,
    headers,
    timeout: timeoutMs,
    validateStatus: () => true,
  };

  if (body && req.method !== "GET" && req.method !== "HEAD") {
    if (req.bodyMode === "form-data") {
      config.data = body;
      config.headers = {
        ...config.headers,
        "Content-Type":
          config.headers?.["Content-Type"] ||
          "application/x-www-form-urlencoded",
      };
    } else {
      try {
        config.data = JSON.parse(body);
      } catch {
        config.data = body;
      }
    }
  }

  return axios.request(config);
}

async function performLogin(
  authConfig: AuthConfig,
  variables: Record<string, string>,
  timeoutMs: number
): Promise<string> {
  const url = substituteVariables(authConfig.loginUrl, variables);
  const headers = substituteInHeaders(authConfig.headers, variables);
  const bodyRaw = substituteVariables(authConfig.bodyTemplate, variables);

  let data: any = bodyRaw;
  try {
    data = JSON.parse(bodyRaw);
  } catch {
    // mantem como texto/form
  }

  const response = await axios.request({
    method: authConfig.method,
    url,
    headers,
    data,
    timeout: timeoutMs,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Falha no login de reautenticacao (HTTP ${response.status})`
    );
  }

  const token = getByPath(response.data, authConfig.tokenResponsePath);
  if (!token) {
    throw new Error(
      `Token nao encontrado no caminho "${authConfig.tokenResponsePath}"`
    );
  }
  return String(token);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runCollectionAgainstCsv(
  collection: Collection,
  environment: Environment | null,
  csv: CsvDataset,
  settings: AppSettings,
  callbacks: RunnerCallbacks
): Promise<ExecutionResult[]> {
  const allResults: ExecutionResult[] = [];
  let sessionVariables: Record<string, string> = {
    ...(environment?.variables || {}),
  };

  const rows = csv.rows.length > 0 ? csv.rows : [{}];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    if (callbacks.isCancelled()) break;
    const row = rows[rowIndex];
    const mergedVariables = { ...sessionVariables, ...row };

    for (const req of collection.requests) {
      if (callbacks.isCancelled()) break;
      callbacks.onProgress(rowIndex + 1, rows.length, req.name);

      const start = performance.now();
      let retriedAuth = false;

      try {
        let response = await executeSingleRequest(
          req,
          mergedVariables,
          settings.timeoutMs
        );

        if (
          response.status === 401 &&
          settings.authConfig?.enabled
        ) {
          retriedAuth = true;
          const newToken = await performLogin(
            settings.authConfig,
            mergedVariables,
            settings.timeoutMs
          );
          sessionVariables[settings.authConfig.tokenVariableName] = newToken;
          mergedVariables[settings.authConfig.tokenVariableName] = newToken;

          if (settings.authConfig.authHeaderName) {
            const headerVal = `${settings.authConfig.authHeaderPrefix || ""}${newToken}`;
            req.headers[settings.authConfig.authHeaderName] = `{{${settings.authConfig.tokenVariableName}}}`;
            mergedVariables[settings.authConfig.tokenVariableName] = newToken;
            void headerVal;
          }

          response = await executeSingleRequest(
            req,
            mergedVariables,
            settings.timeoutMs
          );
        }

        const timeMs = Math.round(performance.now() - start);
        const isSuccess = response.status >= 200 && response.status < 400;

        const result: ExecutionResult = {
          id: uuid(),
          rowIndex,
          requestId: req.id,
          requestName: req.name,
          method: req.method,
          url: req.url,
          status: isSuccess ? "success" : "failure",
          statusCode: response.status,
          timeMs,
          retriedAuth,
          error: isSuccess ? undefined : `HTTP ${response.status}`,
          timestamp: new Date().toISOString(),
        };

        allResults.push(result);
        callbacks.onResult(result);

        if (!isSuccess && !settings.continueOnFailure) {
          return allResults;
        }
      } catch (err: any) {
        const timeMs = Math.round(performance.now() - start);
        const result: ExecutionResult = {
          id: uuid(),
          rowIndex,
          requestId: req.id,
          requestName: req.name,
          method: req.method,
          url: req.url,
          status: "failure",
          timeMs,
          retriedAuth,
          error: err?.message || "Erro desconhecido",
          timestamp: new Date().toISOString(),
        };
        allResults.push(result);
        callbacks.onResult(result);

        if (!settings.continueOnFailure) {
          return allResults;
        }
      }

      if (settings.requestDelayMs > 0) {
        await delay(settings.requestDelayMs);
      }
    }
  }

  return allResults;
}
