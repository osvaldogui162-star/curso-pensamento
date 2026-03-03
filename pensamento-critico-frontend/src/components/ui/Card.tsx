import type { HTMLAttributes } from "react";

type CardAs = "div" | "section" | "article" | "li";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardAs;
}

/**
 * Card de conteúdo. Encapsula estilo consistente (SRP).
 */
export function Card({ as: Component = "div", className = "", ...props }: CardProps) {
  return (
    <Component
      className={[
        "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
