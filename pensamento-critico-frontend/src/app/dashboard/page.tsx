"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { useAuth, useCourses } from "@/hooks";

/**
 * Dashboard — área logada. Responsabilidade: exibir conteúdo do usuário e cursos (SRP).
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { courses, status, error, fetchCourses } = useCourses();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }
    fetchCourses();
  }, [fetchCourses, router, user]);

  return (
    <MainLayout user={user ?? undefined}>
      <div className="flex flex-col gap-10">
        {/* Hero da área do aluno */}
        <header className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <Card className="relative overflow-hidden border-[#15094A]/60 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950/90 shadow-2xl shadow-black/70">
            <div className="pointer-events-none absolute inset-0 opacity-50">
              <div className="absolute -left-16 top-6 h-40 w-40 rounded-full bg-[#15094A]/40 blur-3xl" />
              <div className="absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A5B4FC]">
                Área do aluno
              </p>
              <h1 className="text-2xl font-semibold text-zinc-50">
                Meus cursos e materiais
              </h1>
              {user?.name && (
                <p className="text-sm text-zinc-300">
                  Bem-vindo(a),{" "}
                  <span className="font-medium text-zinc-50">{user.name}</span>. Aqui você
                  acompanha o progresso e acessa todos os módulos em PDF.
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-300">
                <span className="rounded-full border border-[#15094A]/70 bg-[#15094A]/20 px-3 py-1">
                  {courses.length} curso{courses.length === 1 ? "" : "s"} disponível(is)
                </span>
                <span className="rounded-full border border-zinc-700/80 bg-zinc-900/60 px-3 py-1">
                  PDFs protegidos por matrícula ativa
                </span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-between border-zinc-800/80 bg-zinc-950/90 shadow-xl shadow-black/60">
            <div>
              <h2 className="text-sm font-semibold text-zinc-50">Resumo do seu acesso</h2>
              <p className="mt-2 text-xs text-zinc-400">
                Quando a sua matrícula é confirmada, os cursos aparecem aqui automaticamente.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs text-zinc-300">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Cursos
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-50">
                  {courses.length}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-400">
                  {status === "loading"
                    ? "Carregando…"
                    : status === "error"
                    ? "Com atenção"
                    : "Tudo pronto"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => logout()}>
                Sair da conta
              </Button>
            </div>
          </Card>
        </header>

        {/* Lista de cursos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Meus cursos
            </h2>
            <span className="text-xs text-zinc-500">
              {status === "loading"
                ? "Atualizando lista de cursos…"
                : `${courses.length} curso${courses.length === 1 ? "" : "s"} encontrado(s)`}
            </span>
          </div>

          <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/80 px-5 py-6 shadow-2xl shadow-black/70">
            {status === "loading" && (
              <p className="text-sm text-zinc-400">Carregando…</p>
            )}
            {status === "error" && error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            {status === "idle" && courses.length === 0 && (
              <p className="text-sm text-zinc-400">
                Ainda não há cursos disponíveis para você. Assim que sua matrícula for confirmada,
                seus cursos aparecerão aqui com acesso imediato aos módulos.
              </p>
            )}
            {status === "idle" && courses.length > 0 && (
              <ul className="grid gap-5 sm:grid-cols-2">
                {courses.map((course) => (
                  <Card
                    as="li"
                    key={course.id}
                    className="group flex h-full flex-col justify-between border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950/85 transition-transform duration-200 hover:-translate-y-1 hover:border-[#15094A] hover:shadow-xl hover:shadow-black/70"
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A5B4FC]">
                        Curso ativo
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-zinc-50">
                        {course.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
                        {course.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                      <span className="rounded-full bg-[#15094A]/20 px-3 py-1 text-[11px] font-medium text-[#E5E7EB]">
                        Investimento: {course.price.toLocaleString("pt-AO")} Kz
                      </span>
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="text-[11px] font-semibold text-[#A5B4FC] underline-offset-2 hover:underline"
                      >
                        Acessar módulos
                      </Link>
                    </div>
                  </Card>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
