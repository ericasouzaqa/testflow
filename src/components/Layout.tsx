import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="flex h-screen w-screen bg-bg-dark text-white overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-panel opacity-60" />
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
