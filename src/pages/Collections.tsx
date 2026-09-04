import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useAppStore, newId } from "@/store/useAppStore";
import { storageService } from "@/services/storageService";
import { parsePostmanCollection } from "@/services/postmanParser";
import type { Environment } from "@/types";

export function Collections() {
  const {
    collections,
    environments,
    addCollection,
    removeCollection,
    addEnvironment,
    removeEnvironment,
  } = useAppStore();

  const [envName, setEnvName] = useState("");
  const [envVarsText, setEnvVarsText] = useState("chave=valor\noutraChave=outroValor");

  async function handleImportCollection() {
    const file = await storageService.openFileDialog([
      { name: "Postman Collection", extensions: ["json"] },
    ]);
    if (!file) return;
    try {
      const collection = parsePostmanCollection(file.fileName, file.content);
      await addCollection(collection);
    } catch (err) {
      alert("Erro ao importar Collection: arquivo JSON inválido.");
    }
  }

  async function handleCreateEnvironment() {
    if (!envName.trim()) return;
    const variables: Record<string, string> = {};
    envVarsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [key, ...rest] = line.split("=");
        if (key) variables[key.trim()] = rest.join("=").trim();
      });

    const environment: Environment = {
      id: newId(),
      name: envName.trim(),
      variables,
    };
    await addEnvironment(environment);
    setEnvName("");
    setEnvVarsText("chave=valor\noutraChave=outroValor");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-white/50 mt-1">
            Importe collections Postman e gerencie ambientes.
          </p>
        </div>
        <Button onClick={handleImportCollection}>+ Importar Collection</Button>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Collections importadas</h2>
        {collections.length === 0 && (
          <p className="text-white/40 text-sm">Nenhuma collection importada ainda.</p>
        )}
        <div className="space-y-3">
          {collections.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-white/40">
                  {c.requests.length} requisições · {c.fileName}
                </div>
              </div>
              <Button variant="danger" onClick={() => removeCollection(c.id)}>
                Remover
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Novo Ambiente</h2>
        <div className="grid gap-4">
          <input
            className="px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm focus:outline-none focus:border-purple-neon"
            placeholder="Nome do ambiente (ex: Homologação)"
            value={envName}
            onChange={(e) => setEnvName(e.target.value)}
          />
          <textarea
            className="px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm font-mono h-28 focus:outline-none focus:border-purple-neon"
            value={envVarsText}
            onChange={(e) => setEnvVarsText(e.target.value)}
          />
          <div>
            <Button onClick={handleCreateEnvironment}>Salvar Ambiente</Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Ambientes salvos</h2>
        {environments.length === 0 && (
          <p className="text-white/40 text-sm">Nenhum ambiente cadastrado.</p>
        )}
        <div className="space-y-3">
          {environments.map((env) => (
            <div
              key={env.id}
              className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
            >
              <div>
                <div className="font-medium">{env.name}</div>
                <div className="text-xs text-white/40">
                  {Object.keys(env.variables).length} variáveis
                </div>
              </div>
              <Button variant="danger" onClick={() => removeEnvironment(env.id)}>
                Remover
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
