import { useRef, useState } from "react";
import { useAppStore, newId } from "@/store/useAppStore";
import { runCollectionAgainstCsv } from "@/services/httpRunner";
import type { ExecutionResult, HistoryEntry } from "@/types";

export function useRunner() {
  const {
    collections,
    environments,
    csvDatasets,
    settings,
    selectedCollectionId,
    selectedEnvironmentId,
    selectedCsvId,
    setRunProgress,
    resetRunProgress,
    addHistoryEntry,
  } = useAppStore();

  const [lastResults, setLastResults] = useState<ExecutionResult[]>([]);
  const cancelledRef = useRef(false);

  const collection = collections.find((c) => c.id === selectedCollectionId) || null;
  const environment = environments.find((e) => e.id === selectedEnvironmentId) || null;
  const csv = csvDatasets.find((d) => d.id === selectedCsvId) || null;

  const canRun = !!collection && !!csv && collection.requests.length > 0;

  async function start() {
    if (!collection || !csv) return;
    cancelledRef.current = false;
    resetRunProgress();
    setLastResults([]);

    const startedAt = new Date().toISOString();
    setRunProgress({
      running: true,
      totalRows: csv.rows.length || 1,
      currentRow: 0,
      successCount: 0,
      failureCount: 0,
      logs: [],
    });

    const results = await runCollectionAgainstCsv(
      collection,
      environment,
      csv,
      settings,
      {
        onProgress: (currentRow, totalRows, currentRequestName) => {
          setRunProgress({ currentRow, totalRows, currentRequestName });
        },
        onResult: (result) => {
          const state = useAppStore.getState().runProgress;
          setRunProgress({
            successCount:
              state.successCount + (result.status === "success" ? 1 : 0),
            failureCount:
              state.failureCount + (result.status === "failure" ? 1 : 0),
            logs: [...state.logs, result],
          });
        },
        isCancelled: () => cancelledRef.current,
      }
    );

    setLastResults(results);
    setRunProgress({ running: false });

    const finishedAt = new Date().toISOString();
    const entry: HistoryEntry = {
      id: newId(),
      collectionName: collection.name,
      environmentName: environment?.name || "Sem ambiente",
      csvFileName: csv.fileName,
      startedAt,
      finishedAt,
      totalRequests: results.length,
      successCount: results.filter((r) => r.status === "success").length,
      failureCount: results.filter((r) => r.status === "failure").length,
      results,
    };
    await addHistoryEntry(entry);
  }

  function cancel() {
    cancelledRef.current = true;
  }

  return {
    collection,
    environment,
    csv,
    canRun,
    start,
    cancel,
    lastResults,
  };
}
