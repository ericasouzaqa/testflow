import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/useAppStore";
import { useRunner } from "@/hooks/useRunner";
import { exportResultsAsCsv, exportResultsAsXlsx } from "@/services/exportService";

export function Executar() {
  const {
    collections,
    environments,
    csvDatasets,
    selectedCollectionId,
    selectedEnvironmentId,
    selectedCsvId,
    setSelectedCollection,
    setSelectedEnvironment,
    setSelectedCsv,
    runProgress,
  } = useAppStore();

  const { canRun, start, cancel, lastResults } = useRunner();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Executar</h1>
        <p className="text-white/50 mt-1">
          Selecione a Collection, o Ambiente e o CSV, depois execute o lote.
        </p>
      </div>

      <Card>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-2 block">Collection</label>
            <Select
              value={selectedCollectionId ?? ""}
              onChange={(e) => setSelectedCollection(e.target.value || null)}
            >
              <option value="">Selecione...</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Ambiente</label>
            <Select
              value={selectedEnvironmentId ?? ""}
              onChange={(e) => setSelectedEnvironment(e.target.value || null)}
            >
              <option value="">Nenhum</option>
              {environments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">CSV</label>
            <Select
              value={selectedCsvId ?? ""}
              onChange={(e) => setSelectedCsv(e.target.value || null)}
            >
              <option value="">Selecione...</option>
              {csvDatasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fileName}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={start} disabled={!canRun || runProgress.running}>
            ▶️ Executar
          </Button>
          <Button
            variant="danger"
            onClick={cancel}
            disabled={!runProgress.running}
          >
            ⏹ Cancelar
          </Button>
        </div>
      </Card>

      {(runProgress.running || runProgress.logs.length > 0) && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Progresso</h2>
          <ProgressBar value={runProgress.currentRow} max={runProgress.totalRows} />
          <div className="flex gap-6 mt-4 text-sm">
            <div className="text-white/50">
              Requisição atual:{" "}
              <span className="text-white">
                {runProgress.currentRequestName || "-"}
              </span>
            </div>
            <div className="text-emerald-400">
              ✓ Sucesso: {runProgress.successCount}
            </div>
            <div className="text-magenta-neon">
              ✕ Falha: {runProgress.failureCount}
            </div>
          </div>
        </Card>
      )}

      {runProgress.logs.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Resultados</h2>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => exportResultsAsCsv(lastResults.length ? lastResults : runProgress.logs)}
              >
                Exportar CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() => exportResultsAsXlsx(lastResults.length ? lastResults : runProgress.logs)}
              >
                Exportar XLSX
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-bg-panel">
                <tr className="text-left text-white/50 border-b border-white/10">
                  <th className="py-2 pr-4">Linha</th>
                  <th className="py-2 pr-4">Requisição</th>
                  <th className="py-2 pr-4">Método</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">HTTP</th>
                  <th className="py-2 pr-4">Tempo</th>
                  <th className="py-2 pr-4">Erro</th>
                </tr>
              </thead>
              <tbody>
                {runProgress.logs.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-2 pr-4">{r.rowIndex + 1}</td>
                    <td className="py-2 pr-4">{r.requestName}</td>
                    <td className="py-2 pr-4">{r.method}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-2 pr-4">{r.statusCode ?? "-"}</td>
                    <td className="py-2 pr-4">{r.timeMs}ms</td>
                    <td className="py-2 pr-4 text-white/50">{r.error ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
