import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { useAppStore } from "@/store/useAppStore";
import type { AuthConfig, HttpMethod } from "@/types";

const defaultAuth: AuthConfig = {
  enabled: false,
  loginUrl: "{{baseUrl}}/auth/login",
  method: "POST",
  headers: { "Content-Type": "application/json" },
  bodyTemplate: '{"usuario":"{{usuario}}","senha":"{{senha}}"}',
  tokenResponsePath: "data.token",
  tokenVariableName: "token",
  authHeaderName: "Authorization",
  authHeaderPrefix: "Bearer ",
};

export function Configuracoes() {
  const { settings, updateSettings } = useAppStore();
  const [auth, setAuth] = useState<AuthConfig>(
    settings.authConfig || defaultAuth
  );

  async function saveAuth() {
    await updateSettings({ authConfig: auth });
  }

  async function saveGeneral(partial: Partial<typeof settings>) {
    await updateSettings(partial);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-white/50 mt-1">
          Ajustes gerais de execução e reautenticação automática.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Execução</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-2 block">
              Continuar mesmo com falhas
            </label>
            <Select
              value={settings.continueOnFailure ? "true" : "false"}
              onChange={(e) =>
                saveGeneral({ continueOnFailure: e.target.value === "true" })
              }
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </Select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">
              Delay entre requisições (ms)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm"
              value={settings.requestDelayMs}
              onChange={(e) =>
                saveGeneral({ requestDelayMs: Number(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">
              Timeout (ms)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm"
              value={settings.timeoutMs}
              onChange={(e) =>
                saveGeneral({ timeoutMs: Number(e.target.value) || 15000 })
              }
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Renovação Automática de Token</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={auth.enabled}
              onChange={(e) => setAuth({ ...auth, enabled: e.target.checked })}
            />
            Ativado
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-2 block">
              URL de Login
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm"
              value={auth.loginUrl}
              onChange={(e) => setAuth({ ...auth, loginUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Método</label>
            <Select
              value={auth.method}
              onChange={(e) =>
                setAuth({ ...auth, method: e.target.value as HttpMethod })
              }
            >
              {["GET", "POST", "PUT", "PATCH"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-white/50 mb-2 block">
              Corpo da Requisição (JSON, aceita variáveis {"{{var}}"})
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm font-mono h-24"
              value={auth.bodyTemplate}
              onChange={(e) => setAuth({ ...auth, bodyTemplate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">
              Caminho do Token na Resposta
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm font-mono"
              placeholder="data.token"
              value={auth.tokenResponsePath}
              onChange={(e) =>
                setAuth({ ...auth, tokenResponsePath: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">
              Nome da Variável de Token
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm font-mono"
              placeholder="token"
              value={auth.tokenVariableName}
              onChange={(e) =>
                setAuth({ ...auth, tokenVariableName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">
              Header de Autorização
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm font-mono"
              placeholder="Authorization"
              value={auth.authHeaderName}
              onChange={(e) =>
                setAuth({ ...auth, authHeaderName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">
              Prefixo do Header
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-sm font-mono"
              placeholder="Bearer "
              value={auth.authHeaderPrefix}
              onChange={(e) =>
                setAuth({ ...auth, authHeaderPrefix: e.target.value })
              }
            />
          </div>
        </div>

        <p className="text-xs text-white/40 mt-4">
          Quando uma requisição retornar HTTP 401, o TESTFLOW fará login
          automaticamente usando essa configuração, atualizará a variável de
          token e reexecutará a requisição uma vez.
        </p>

        <div className="mt-4">
          <Button onClick={saveAuth}>Salvar Configuração de Autenticação</Button>
        </div>
      </Card>
    </div>
  );
}
