"use client";

import Link from "next/link";
import { useState } from "react";
import type { SocialLinkItem } from "./SocialLinks";
import { SocialLinks } from "./SocialLinks";

export interface NavItem {
  label: string;
  href: string;
}

interface LandingHeaderProps {
  siteName: string;
  navItems: NavItem[];
  ctaLoginHref: string;
  ctaRegisterHref: string;
  ctaRegisterLabel: string;
  socialLinks: SocialLinkItem[];
}

/**
 * Cabeçalho da landing. SRP: logo, navegação e CTAs da página inicial.
 * Padrão: composição via props (injeção de dependências de conteúdo).
 */
export function LandingHeader({
  siteName,
  navItems,
  ctaLoginHref,
  ctaRegisterHref,
  ctaRegisterLabel,
  socialLinks,
}: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b-4 border-b-[#15094A] bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        {/* Logo / Nome do site */}
        <Link
          href="/"
          className="flex flex-col text-zinc-100 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <span className="text-sm font-medium tracking-wide text-zinc-300">
            {siteName.split(" ")[0]}
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            {siteName.split(" ").slice(1).join(" ") || siteName}
          </span>
        </Link>

        {/* Nav desktop */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navegação principal"
        >
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTAs + Social desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <SocialLinks links={socialLinks} />
          <div className="flex items-center gap-3">
            <Link
              href={ctaLoginHref}
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href={ctaRegisterHref}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
            >
              {ctaRegisterLabel}
            </Link>
          </div>
        </div>

        {/* Mobile: menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <SocialLinks links={socialLinks} />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      <div
        id="mobile-nav"
        className={`border-t border-zinc-800 bg-zinc-950/98 md:hidden ${menuOpen ? "block" : "hidden"}`}
        role="region"
        aria-label="Menu móvel"
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Navegação móvel">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
            >
              {label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800 pt-4">
            <Link
              href={ctaLoginHref}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-800/50"
            >
              Entrar
            </Link>
            <Link
              href={ctaRegisterHref}
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-900"
            >
              {ctaRegisterLabel}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
