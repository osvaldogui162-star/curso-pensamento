import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "xs" | "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#15094A] text-zinc-50 hover:bg-[#1b0e70] dark:bg-[#15094A] dark:text-zinc-50 dark:hover:bg-[#1b0e70]",
  secondary:
    "border border-[#15094A] text-[#15094A] hover:bg-[#15094A] hover:text-white dark:border-[#15094A] dark:text-zinc-100 dark:hover:bg-[#15094A]",
  ghost:
    "text-[#15094A] hover:bg-[#15094A]/10 dark:text-zinc-100 dark:hover:bg-[#15094A]/20",
  danger:
    "border border-red-500/60 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:border-red-400 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-9 min-h-9 px-4 text-sm",
  sm: "h-10 min-h-10 px-5 text-sm",
  md: "h-12 min-h-12 px-5 text-base",
};

/**
 * Componente atômico de botão. Uma única responsabilidade: renderizar botão (SRP).
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  disabled,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={[
        "inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      {...props}
    />
  );
}
