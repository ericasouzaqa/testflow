import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

const variants: Record<string, string> = {
  primary:
    "bg-gradient-neon text-white shadow-glow hover:opacity-90 disabled:opacity-40",
  secondary:
    "bg-white/5 text-white border border-white/15 hover:bg-white/10 disabled:opacity-40",
  danger:
    "bg-magenta-neon/20 text-magenta-neon border border-magenta-neon/40 hover:bg-magenta-neon/30 disabled:opacity-40",
  ghost: "text-white/60 hover:text-white hover:bg-white/5",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed",
        variants[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
