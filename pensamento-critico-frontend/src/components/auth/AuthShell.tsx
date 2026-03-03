import type { ReactNode } from "react";
import fundoBanner from "@/styles/imagens/fundo.webp";

interface AuthShellProps {
  children: ReactNode;
}

/**
 * Layout de autenticação.
 * SRP: aplicar fundo e tratamento visual consistente para páginas de login/registro.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Fundo geral compartilhado com a landing */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${fundoBanner.src})` }}
        aria-hidden
      />
      {/* Overlay para leitura do layout */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-zinc-950/85 via-zinc-950/90 to-zinc-950/95"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:px-6">
        {/* Coluna esquerda: formulário */}
        <div className="order-1 flex justify-center md:justify-start">{children}</div>

        {/* Coluna direita: imagem/visual */}
        <div className="order-2 hidden md:block">
          <div className="relative h-[520px] w-full overflow-hidden rounded-3xl border border-[#15094A] bg-zinc-900/50 shadow-2xl shadow-black/60">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${fundoBanner.src})` }}
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-tr from-zinc-950/80 via-[#15094A]/35 to-zinc-900/30"
              aria-hidden
            />
            <div className="relative z-10 flex h-full items-end p-8">
              <div className="max-w-sm rounded-2xl border border-[#15094A]/70 bg-zinc-950/70 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A5B4FC]">
                  Pensamento Crítico
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-100">
                  Clareza mental para decisões melhores
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Entre ou crie sua conta para acessar os módulos e evoluir seu raciocínio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

