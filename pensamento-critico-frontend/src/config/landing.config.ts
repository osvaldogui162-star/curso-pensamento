import type { NavItem } from "@/components/landing";
import type { SocialLinkItem } from "@/components/landing";

/**
 * Configuração da landing em um único módulo (SRP).
 * Facilita manutenção e testes; alterações em um só lugar.
 */
export const LANDING_CONFIG = {
  siteName: "Pensamento Crítico",

  nav: [
    { label: "Início", href: "/" },
    { label: "Cursos", href: "#cursos" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ] satisfies NavItem[],

  hero: {
    title: "Pensamento Crítico e Clareza Mental",
    description:
      "Desenvolva competências de análise, argumentação e tomada de decisão. Aprenda a pensar com clareza e comunicar com impacto.",
    ctaLabel: "Criar conta",
    ctaHref: "/register",
    ctaSecondaryLabel: "Já tenho conta",
    ctaSecondaryHref: "/login",
  },

  cta: {
    loginHref: "/login",
    registerHref: "/register",
    registerLabel: "Criar conta",
  },

  social: [
    { href: "https://instagram.com", label: "Instagram", icon: "instagram" as const },
    { href: "https://facebook.com", label: "Facebook", icon: "facebook" as const },
    { href: "https://youtube.com", label: "YouTube", icon: "youtube" as const },
  ] satisfies SocialLinkItem[],
} as const;
