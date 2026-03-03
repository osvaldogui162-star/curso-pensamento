/**
 * Indicador de rolagem (chevron para baixo). SRP: sinalizar que há mais conteúdo abaixo.
 */
export function ScrollIndicator() {
  return (
    <a
      href="#conteudo"
      aria-label="Rolar para o conteúdo"
      className="absolute bottom-10 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-[#15094A] bg-zinc-950/90 text-zinc-100 shadow-lg shadow-black/40 transition-transform transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#15094A]/70 focus:ring-offset-2 focus:ring-offset-zinc-950 animate-bounce-slow"
    >
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </a>
  );
}
