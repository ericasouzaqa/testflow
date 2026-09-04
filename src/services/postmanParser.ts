import { v4 as uuid } from "uuid";
import type { Collection, HttpMethod, PostmanRequestItem } from "@/types";

function extractUrl(urlField: any): string {
  if (!urlField) return "";
  if (typeof urlField === "string") return urlField;
  if (typeof urlField.raw === "string") return urlField.raw;
  return "";
}

function extractHeaders(headerField: any[]): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!Array.isArray(headerField)) return headers;
  for (const h of headerField) {
    if (h && h.key && !h.disabled) {
      headers[h.key] = h.value ?? "";
    }
  }
  return headers;
}

function extractBody(bodyField: any): {
  body?: string;
  bodyMode?: "raw" | "form-data" | "none";
} {
  if (!bodyField) return { bodyMode: "none" };
  if (bodyField.mode === "raw") {
    return { body: bodyField.raw ?? "", bodyMode: "raw" };
  }
  if (bodyField.mode === "formdata" || bodyField.mode === "urlencoded") {
    const params = (bodyField.formdata || bodyField.urlencoded || [])
      .filter((p: any) => !p.disabled)
      .map((p: any) => `${p.key}=${p.value}`)
      .join("&");
    return { body: params, bodyMode: "form-data" };
  }
  return { bodyMode: "none" };
}

function walkItems(items: any[], acc: PostmanRequestItem[]) {
  for (const item of items) {
    if (item.item && Array.isArray(item.item)) {
      walkItems(item.item, acc);
      continue;
    }
    if (item.request) {
      const req = item.request;
      const method = (req.method || "GET").toUpperCase() as HttpMethod;
      const { body, bodyMode } = extractBody(req.body);
      acc.push({
        id: uuid(),
        name: item.name || "Request sem nome",
        method,
        url: extractUrl(req.url),
        headers: extractHeaders(req.header),
        body,
        bodyMode,
      });
    }
  }
}

export function parsePostmanCollection(
  fileName: string,
  rawJson: string
): Collection {
  const parsed = JSON.parse(rawJson);
  const requests: PostmanRequestItem[] = [];
  const items = parsed.item || parsed.items || [];
  walkItems(items, requests);

  return {
    id: uuid(),
    name: parsed.info?.name || fileName.replace(/\.json$/i, ""),
    fileName,
    importedAt: new Date().toISOString(),
    requests,
  };
}
