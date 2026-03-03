import Link from "next/link";

interface HeaderProps {
  /** Se o usuário está autenticado, pode mostrar nome e logout */
  user?: { name: string } | null;
}

/**
 * Cabeçalho global. Responsabilidade: estrutura e links de navegação (SRP).
 */
export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
          Pensamento Crítico
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                Dashboard
              </Link>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{user.name}</span>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                Entrar
              </Link>
              <Link href="/register" className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
