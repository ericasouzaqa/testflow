import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Collections } from "@/pages/Collections";
import { CsvPage } from "@/pages/CsvPage";
import { Executar } from "@/pages/Executar";
import { Historico } from "@/pages/Historico";
import { Configuracoes } from "@/pages/Configuracoes";
import { useAppStore } from "@/store/useAppStore";

export default function App() {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-dark text-white">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
            TESTFLOW
          </div>
          <div className="text-white/40 text-sm mt-2">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/csv" element={<CsvPage />} />
          <Route path="/executar" element={<Executar />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
