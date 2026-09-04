import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { exportResultsAsCsv, exportResultsAsXlsx } from "@/services/exportService";
import type { HistoryEntry } from "@/types";

export function Historico() {
  const { history, clearHistory } = useAppStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(entry: HistoryEntry) {
    setExpanded(expanded === entry.id ? null : entry.id);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico</h1>
          <p className="text-white/50 mt-1">
            Execuções anteriores salvas localmente.
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="danger" onClick={clearHistory}>
            Limpar Histórico
          </Button>
        )}
      </div>

      {history.length === 0 && (
        <Card>
          <p className="text-white/40 text-sm">Nenhuma execução registrada ainda.</p>
        </Card>
      )}

      <div className="space-y-4">
        {history.map((entry) => (
          <Card key={entry.id}>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggle(entry)}
            >
              <div>
                <div className="font-semibold">
                  {entry.collectionName}{" "}
                  <span className="text-white/40 font-normal">
                    · {entry.environmentName} · {entry.csvFileName}
                  </span>
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {new Date(entry.startedAt).toLocaleString("pt-BR")}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-emerald-400 text-sm">
                  ✓ {entry.successCount}
                </span>
                <span className="text-magenta-neon text-sm">
                  ✕ {entry.failureCount}
                </span>
              </div>
            </div>

            {expanded === entry.id && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="flex gap-3 mb-4">
                  <Button
                    variant="secondary"
                    onClick={() => exportResultsAsCsv(entry.results)}
                  >
                    Exportar CSV
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => exportResultsAsXlsx(entry.results)}
                  >
                    Exportar XLSX
                  </Button>
                </div>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/50 border-b border-white/10">
                        <th className="py-2 pr-4">Linha</th>
                        <th className="py-2 pr-4">Requisição</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">HTTP</th>
                        <th className="py-2 pr-4">Tempo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.results.map((r) => (
                        <tr key={r.id} className="border-b border-white/5">
                          <td className="py-2 pr-4">{r.rowIndex + 1}</td>
                          <td className="py-2 pr-4">{r.requestName}</td>
                          <td className="py-2 pr-4">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="py-2 pr-4">{r.statusCode ?? "-"}</td>
                          <td className="py-2 pr-4">{r.timeMs}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
