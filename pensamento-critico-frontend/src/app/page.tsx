import { LandingHeader, HeroBanner } from "@/components/landing";
import { LANDING_CONFIG } from "@/config/landing.config";
import fundoBanner from "@/styles/imagens/fundo.webp";

/**
 * Landing page — ponto de entrada principal.
 * SRP: compor header + hero + seções; conteúdo vem de config.
 */
export default function Home() {
  const { siteName, nav, hero, cta, social } = LANDING_CONFIG;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <LandingHeader
        siteName={siteName}
        navItems={nav}
        ctaLoginHref={cta.loginHref}
        ctaRegisterHref={cta.registerHref}
        ctaRegisterLabel={cta.registerLabel}
        socialLinks={social}
      />
      <HeroBanner
        title={hero.title}
        description={hero.description}
        ctaLabel={hero.ctaLabel}
        ctaHref={hero.ctaHref}
        ctaSecondaryLabel={hero.ctaSecondaryLabel}
        ctaSecondaryHref={hero.ctaSecondaryHref}
      />
      <section
        id="conteudo"
        className="relative z-10 overflow-hidden border-t border-zinc-800 bg-zinc-900 px-4 py-20 md:px-6"
        aria-label="Por que Pensamento Crítico e cursos disponíveis"
      >
        {/* Imagem de fundo com efeito parallax via scroll (bg-fixed) */}
        <div
          className="pointer-events-none absolute inset-0 bg-fixed bg-cover bg-right md:bg-[length:auto_130%] opacity-60 md:opacity-80"
          style={{ backgroundImage: `url(${fundoBanner.src})` }}
          aria-hidden
        />
        {/* Overlay para garantir legibilidade do conteúdo sem esconder a imagem */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/65 to-zinc-900/90"
          aria-hidden
        />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:items-start">
          {/* Texto explicativo */}
          <div className="md:w-2/5">
            <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
              Por que Pensamento Crítico?
            </h2>
            <p className="mb-4 text-lg leading-relaxed text-zinc-300">
              Pensar com clareza é a base para decisões sábias, comunicação assertiva
              e liderança madura. O nosso programa foi desenhado para sair da teoria
              e entrar na prática do seu dia a dia.
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Nesta formação, você percorre uma trilha estruturada de 8 módulos em PDF,
              com conteúdos objetivos, provocações profundas e exercícios de aplicação
              imediata.
            </p>
          </div>

          {/* Cursos Disponíveis / cards com leve efeito parallax */}
          <div className="md:w-3/5">
            <h3 className="mb-6 text-xl font-semibold text-white">
              Cursos disponíveis
            </h3>
            <div className="grid gap-6 md:grid-cols-1" id="cursos">
              <article className="course-card parallax-card">
                <div className="parallax-card-inner">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        Pensamento Crítico e Clareza Mental
                      </h4>
                      <p className="mt-2 text-sm text-zinc-300">
                        Formação completa em 8 módulos PDF para desenvolver análise,
                        argumentação e discernimento em cenários complexos.
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full bg-[#15094A] px-3 py-1 text-xs font-semibold text-white shadow-md shadow-black/50">
                      150.000 Kz
                    </div>
                  </div>

                  <details className="mt-5 group" open>
                    <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-[#15094A] bg-[#15094A]/10 px-4 py-2 text-sm font-semibold text-[#E5E7EB] shadow-sm shadow-black/40 transition-all duration-300 hover:bg-[#15094A]/25 hover:text-white hover:shadow-lg hover:shadow-black/60 outline-none">
                      <span className="text-xs uppercase tracking-wide text-[#A5B4FC]">
                        Ver em detalhe
                      </span>
                      <span className="text-[11px] font-semibold">
                        o que você vai aprender
                      </span>
                      <span className="ml-auto text-[11px] transition-transform group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <ul className="mt-3 space-y-1.5 text-sm text-zinc-200">
                      <li>• Identificar falácias e vieses em argumentos do dia a dia.</li>
                      <li>• Estruturar raciocínios claros para decisões profissionais e pessoais.</li>
                      <li>• Comunicar ideias complexas com simplicidade e impacto.</li>
                      <li>• Criar hábitos de reflexão profunda e análise crítica contínua.</li>
                    </ul>
                    <p className="mt-4 text-[12px] text-zinc-400">
                      Cada módulo em PDF traz explicações objetivas, exemplos reais e exercícios
                      práticos para aplicar imediatamente.
                    </p>
                  </details>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-300">
                    <span className="rounded-full bg-[#15094A]/15 px-3 py-1">
                      Acesso completo ao curso após validação do pagamento
                    </span>
                    <span className="hidden md:inline text-zinc-500">
                      Formato: 8 PDFs • 100% online
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative mt-0 border-t border-[#15094A] bg-zinc-950 px-4 py-16 md:px-6">
        {/* Imagem de fundo fixa para efeito parallax no rodapé */}
        <div
          className="pointer-events-none absolute inset-0 bg-fixed bg-cover bg-right md:bg-[length:auto_140%] opacity-40 md:opacity-60"
          style={{ backgroundImage: `url(${fundoBanner.src})` }}
          aria-hidden
        />
        {/* Overlay escura para contraste */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-zinc-900/80"
          aria-hidden
        />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:justify-between">
          {/* Bloco de marca */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15094A] text-sm font-bold text-white shadow-lg shadow-black/50">
                PC
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Pensamento Crítico
                </h3>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Formação &amp; Mentoria
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              Uma trilha em 8 módulos PDF para quem leva a sério clareza mental,
              profundidade de raciocínio e decisões responsáveis.
            </p>
            <span className="mt-3 inline-flex items-center rounded-full border border-[#15094A] bg-[#15094A]/10 px-3 py-1 text-[11px] font-medium text-zinc-200">
              Conteúdo estruturado • Acesso controlado
            </span>
          </div>

          {/* Navegação e ajuda */}
          <div className="flex flex-1 flex-col gap-8 md:flex-row md:justify-end">
            <div className="min-w-[160px]">
              <h4 className="text-sm font-semibold text-white">Navegação</h4>
              <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                <li>
                  <a href="#conteudo" className="hover:text-white">
                    Por que Pensamento Crítico
                  </a>
                </li>
                <li>
                  <a href="#cursos" className="hover:text-white">
                    Cursos disponíveis
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:text-white">
                    Entrar
                  </a>
                </li>
                <li>
                  <a href="/register" className="hover:text-white">
                    Criar conta
                  </a>
                </li>
              </ul>
            </div>

            <div className="min-w-[210px]">
              <h4 className="text-sm font-semibold text-white">Contacto</h4>
              <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                <li>E-mail: contato@pensamentocritico.ao</li>
                <li>Mentoria online • Conteúdos em PDF</li>
              </ul>
              <h5 className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Fique por dentro
              </h5>
              <p className="mt-1 text-xs text-zinc-500">
                Receba novidades sobre novos conteúdos e trilhas.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  className="h-9 flex-1 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-[#15094A] focus:outline-none focus:ring-1 focus:ring-[#15094A]"
                  placeholder="Seu melhor e-mail"
                />
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-full bg-[#15094A] px-4 text-xs font-medium text-white hover:bg-[#1b0e70]"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-zinc-800/80 pt-6 text-xs text-zinc-500 md:flex-row">
          <span>
            © {new Date().getFullYear()} Pensamento Crítico. Todos os direitos
            reservados.
          </span>
          <span className="text-[11px]">
            Conteúdo protegido. Acesso liberado apenas após validação de
            pagamento.
          </span>
        </div>
      </footer>
    </div>
  );
}
