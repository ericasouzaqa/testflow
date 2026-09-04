import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useAppStore } from "@/store/useAppStore";
import { storageService } from "@/services/storageService";
import { parseCsv } from "@/services/csvService";

export function CsvPage() {
  const { csvDatasets, addCsvDataset, removeCsvDataset, selectedCsvId, setSelectedCsv } =
    useAppStore();

  async function handleImportCsv() {
    const file = await storageService.openFileDialog([
      { name: "CSV", extensions: ["csv"] },
    ]);
    if (!file) return;
    const dataset = parseCsv(file.fileName, file.content);
    await addCsvDataset(dataset);
  }

  const selected = csvDatasets.find((d) => d.id === selectedCsvId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CSV</h1>
          <p className="text-white/50 mt-1">
            Importe o CSV que substituirá as variáveis das requisições.
          </p>
        </div>
        <Button onClick={handleImportCsv}>+ Importar CSV</Button>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Datasets importados</h2>
        {csvDatasets.length === 0 && (
          <p className="text-white/40 text-sm">Nenhum CSV importado ainda.</p>
        )}
        <div className="space-y-3">
          {csvDatasets.map((d) => (
            <div
              key={d.id}
              className={[
                "flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                d.id === selectedCsvId
                  ? "border-cyan-neon/60 bg-cyan-neon/5"
                  : "border-white/10 hover:border-white/25",
              ].join(" ")}
              onClick={() => setSelectedCsv(d.id)}
            >
              <div>
                <div className="font-medium">{d.fileName}</div>
                <div className="text-xs text-white/40">
                  {d.rows.length} linhas · {d.headers.length} colunas
                </div>
              </div>
              <Button
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCsvDataset(d.id);
                }}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {selected && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">
            Pré-visualização — {selected.fileName}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/50 border-b border-white/10">
                  {selected.headers.map((h) => (
                    <th key={h} className="py-2 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.rows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    {selected.headers.map((h) => (
                      <td key={h} className="py-2 pr-4 text-white/80">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected.rows.length > 10 && (
            <p className="text-xs text-white/40 mt-3">
              Exibindo 10 de {selected.rows.length} linhas.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
