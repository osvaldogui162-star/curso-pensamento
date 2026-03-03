import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Input reutilizável com label e mensagem de erro (SRP).
 */
export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-200">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "h-12 rounded-lg border bg-zinc-900/60 px-3 py-2 text-zinc-100 outline-none transition-colors placeholder:text-zinc-400",
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-zinc-700 focus:ring-2 focus:ring-[#15094A]/40",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
