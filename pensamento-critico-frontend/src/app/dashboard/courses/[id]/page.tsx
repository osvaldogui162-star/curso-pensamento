"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/hooks";
import { courseService, pdfService } from "@/services";
import type { CourseWithModules, Module } from "@/services/types/course.types";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [data, setData] = useState<CourseWithModules | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const courseId = Number(params.id);
    if (!courseId || Number.isNaN(courseId)) return;

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const result = await courseService.getByIdWithModules(courseId);
        setData(result);
        setStatus("idle");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar curso");
        setStatus("error");
      }
    }

    load();
  }, [params.id]);

  async function handleOpenPdf(module: Module) {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const { signed_url } = await pdfService.getModulePdf(module.id);
      if (signed_url) {
        window.open(signed_url, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      const err = e as any;
      if (err?.response?.status === 403 && err?.response?.data?.error === "enrollment_not_found") {
        router.push(`/dashboard/courses/${Number(params.id)}/payment`);
        return;
      }

      const apiMessage =
        err?.response?.data?.message ??
        (e instanceof Error ? e.message : "Ocorreu um erro ao tentar abrir o PDF.");
      alert(apiMessage);
    }
  }

  const course = data?.course;
  const modules = data?.modules ?? [];

  return (
    <MainLayout user={user ?? undefined}>
      <div className="flex flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A5B4FC]"
              onClick={() => router.push("/dashboard")}
            >
              ← Voltar para meus cursos
            </button>
            <h1 className="mt-3 text-2xl font-semibold text-zinc-50">
              {course ? course.name : "Carregando curso…"}
            </h1>
            {course && (
              <p className="mt-2 max-w-2xl text-sm text-zinc-300">
                {course.description}
              </p>
            )}
          </div>
          <Button variant="secondary" onClick={() => logout()}>
            Sair
          </Button>
        </header>

        <section className="rounded-3xl border border-[#15094A]/40 bg-zinc-950/70 px-5 py-6 shadow-2xl shadow-black/60">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-zinc-50">Módulos do curso</h2>
            {course && (
              <span className="text-xs text-zinc-400">
                Investimento: {course.price.toLocaleString("pt-AO")} Kz
              </span>
            )}
          </div>

          {status === "loading" && (
            <p className="text-sm text-zinc-400">Carregando módulos…</p>
          )}
          {status === "error" && error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          {status === "idle" && modules.length === 0 && (
            <p className="text-sm text-zinc-400">
              Nenhum módulo encontrado para este curso.
            </p>
          )}
          {status === "idle" && modules.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2">
              {modules.map((module) => (
                <li key={module.id}>
                  <Card className="flex h-full flex-col justify-between border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950/90">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A5B4FC]">
                        Módulo {module.order}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-zinc-50">
                        {module.title}
                      </h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-zinc-400">
                        Formato: PDF • Acesso protegido
                      </span>
                      <Button
                        type="button"
                        className="h-10 min-h-10 px-4 text-sm"
                        onClick={() => handleOpenPdf(module)}
                      >
                        Abrir PDF
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

