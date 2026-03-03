import type { ReactNode } from "react";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  user?: { name: string } | null;
}

/**
 * Layout principal: header + área de conteúdo.
 * Única responsabilidade: composição de layout (SRP).
 */
export function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header user={user} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
