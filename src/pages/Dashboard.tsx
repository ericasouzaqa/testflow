import { Link } from "react-router-dom";
import { Card } from "@/components/Card";
import { useAppStore } from "@/store/useAppStore";

export function Dashboard() {
  const { collections, environments, history } = useAppStore();

  const totalRuns = history.length;
  const totalSuccess = history.reduce((acc, h) => acc + h.successCount, 0);
  const totalFailure = history.reduce((acc, h) => acc + h.failureCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-white/50 mt-1">
          Visão geral do TESTFLOW — seu runner de collections.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glow="purple">
          <div className="text-white/50 text-sm">Collections</div>
          <div className="text-3xl font-bold mt-2">{collections.length}</div>
        </Card>
        <Card glow="cyan">
          <div className="text-white/50 text-sm">Ambientes</div>
          <div className="text-3xl font-bold mt-2">{environments.length}</div>
        </Card>
        <Card glow="magenta">
          <div className="text-white/50 text-sm">Execuções</div>
          <div className="text-3xl font-bold mt-2">{totalRuns}</div>
        </Card>
        <Card glow="purple">
          <div className="text-white/50 text-sm">Sucesso / Falha</div>
          <div className="text-3xl font-bold mt-2">
            <span className="text-emerald-400">{totalSuccess}</span>
            <span className="text-white/30"> / </span>
            <span className="text-magenta-neon">{totalFailure}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/collections">
          <Card glow="purple" className="cursor-pointer hover:border-purple-neon/50">
            <div className="text-lg font-semibold">📦 Importar Collection</div>
            <p className="text-white/50 text-sm mt-2">
              Importe uma Collection Postman (.json) para começar.
            </p>
          </Card>
        </Link>
        <Link to="/csv">
          <Card glow="cyan" className="cursor-pointer hover:border-cyan-neon/50">
            <div className="text-lg font-semibold">📄 Importar CSV</div>
            <p className="text-white/50 text-sm mt-2">
              Carregue os dados que substituirão as variáveis.
            </p>
          </Card>
        </Link>
        <Link to="/executar">
          <Card glow="magenta" className="cursor-pointer hover:border-magenta-neon/50">
            <div className="text-lg font-semibold">▶️ Executar</div>
            <p className="text-white/50 text-sm mt-2">
              Rode o lote de requisições e acompanhe em tempo real.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
