import Link from "next/link";
import { ScrollIndicator } from "./ScrollIndicator";
import fundoBanner from "@/styles/imagens/fundo.webp";

export interface HeroBannerProps {
  /** Título principal (ex.: nome do curso ou marca) */
  title: string;
  /** Descrição curta */
  description: string;
  /** Texto do CTA principal */
  ctaLabel: string;
  /** URL do CTA principal */
  ctaHref: string;
  /** Texto do CTA secundário (opcional) */
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
}

/**
 * Banner hero da landing. SRP: exibir mensagem de formação/mentoria e CTAs.
 * Estilo prateado/monocromático; conteúdo injetado por props (OCP).
 */
export function HeroBanner({
  title,
  description,
  ctaLabel,
  ctaHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
}: HeroBannerProps) {
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden bg-zinc-950 px-4 pt-24 pb-20 md:px-6"
      aria-labelledby="hero-title"
    >
      {/* Imagem de fundo principal do banner (ocupando toda a seção) */}
      <div
        className="absolute inset-0 bg-cover bg-right md:bg-[length:auto_120%]"
        style={{ backgroundImage: `url(${fundoBanner.src})` }}
        aria-hidden
      />
      {/* Overlay em gradiente prateado para profundidade */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 via-zinc-950/70 to-zinc-950"
        aria-hidden
      />
      {/* Textura sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:items-stretch">
        {/* Coluna de texto (esquerda) */}
        <div className="flex w-full flex-1 flex-col items-start text-left md:max-w-xl">
          <h1
            id="hero-title"
            className="hero-title-animate mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
          >
            {title}
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
            {description}
          </p>
          <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
            <Link
              href={ctaHref}
              className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-[#15094A] px-6 text-base font-semibold text-white transition-all hover:bg-[#1b0e70] focus:outline-none focus:ring-2 focus:ring-[#15094A]/60 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              {ctaLabel}
            </Link>
            {ctaSecondaryLabel && ctaSecondaryHref && (
              <Link
                href={ctaSecondaryHref}
                className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full border border-[#15094A] bg-transparent px-6 text-base font-medium text-[#15094A] transition-colors hover:bg-[#15094A] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#15094A]/60 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                {ctaSecondaryLabel}
              </Link>
            )}
          </div>
        </div>

        {/* Coluna “visual” (direita) apenas para dar respiro sobre a área da foto */}
        <div className="hidden w-full flex-1 md:block" aria-hidden />
      </div>

      <ScrollIndicator />
    </section>
  );
}
