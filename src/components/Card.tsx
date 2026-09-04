import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: "purple" | "magenta" | "cyan" | "none";
}

const glowMap: Record<string, string> = {
  purple: "hover:shadow-glow",
  magenta: "hover:shadow-glow-magenta",
  cyan: "hover:shadow-glow-cyan",
  none: "",
};

export function Card({ children, className = "", glow = "purple" }: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-bg-panel/60 backdrop-blur-xl p-6 transition-shadow duration-300",
        glowMap[glow],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
