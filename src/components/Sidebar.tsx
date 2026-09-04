import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/collections", label: "Collections", icon: "📦" },
  { to: "/csv", label: "CSV", icon: "📄" },
  { to: "/executar", label: "Executar", icon: "▶️" },
  { to: "/historico", label: "Histórico", icon: "🕒" },
  { to: "/configuracoes", label: "Configurações", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen flex flex-col bg-bg-panel/80 border-r border-purple-neon/20 backdrop-blur-xl">
      <div className="px-6 py-6 border-b border-purple-neon/20">
        <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
          TESTFLOW
        </div>
        <div className="text-xs text-white/40 mt-1">
          Runner de Collections
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-neon text-white shadow-glow"
                  : "text-white/60 hover:text-white hover:bg-white/5",
              ].join(" ")
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-purple-neon/20 text-xs text-white/30">
        v1.0.0 · sem servidor externo
      </div>
    </aside>
  );
}
