interface StatusBadgeProps {
  status: "success" | "failure" | "skipped";
}

const styles: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  failure: "bg-magenta-neon/15 text-magenta-neon border-magenta-neon/40",
  skipped: "bg-white/10 text-white/50 border-white/20",
};

const labels: Record<string, string> = {
  success: "Sucesso",
  failure: "Falha",
  skipped: "Ignorado",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
