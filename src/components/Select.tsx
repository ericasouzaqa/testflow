import { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ children, className = "", ...rest }: SelectProps) {
  return (
    <select
      className={[
        "w-full px-4 py-2.5 rounded-xl bg-bg-dark border border-white/15 text-white text-sm",
        "focus:outline-none focus:border-purple-neon focus:shadow-glow transition-all",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </select>
  );
}
