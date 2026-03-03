"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/hooks";
import { paymentService } from "@/services";
import type { PaymentRequest } from "@/services/types/course.types";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PaymentRequest[]>([]);

  const pendingCount = useMemo(() => items.filter((i) => i.status === "pending").length, [items]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const data = await paymentService.adminListRequests("pending");
        setItems(data);
        setStatus("idle");
      } catch (e) {
        const err = e as any;
        setError(err?.response?.data?.message ?? (e instanceof Error ? e.message : "Erro ao carregar"));
        setStatus("error");
      }
    }

    load();
  }, [router, user]);

  async function approve(id: number) {
    await paymentService.adminApprove(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  async function reject(id: number) {
    await paymentService.adminReject(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <MainLayout user={user ?? undefined}>
      <div className="flex flex-col gap-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A5B4FC]">
              Área administrativa
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Pagamentos pendentes
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {status === "loading" ? "Carregando…" : `${pendingCount} pedido(s) pendente(s)`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push("/admin")}>
              Voltar
            </Button>
            <Button variant="secondary" onClick={() => logout()}>
              Sair
            </Button>
          </div>
        </header>

        <Card className="border-[#15094A]/40 bg-zinc-950/80 shadow-2xl shadow-black/70">
          {status === "loading" && <p className="text-sm text-zinc-400">Carregando…</p>}
          {status === "error" && error && <p className="text-sm text-red-400">{error}</p>}
          {status === "idle" && items.length === 0 && (
            <p className="text-sm text-zinc-400">Nenhum pedido pendente no momento.</p>
          )}
          {status === "idle" && items.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2">
              {items.map((p) => (
                <Card
                  key={p.id}
                  className="flex h-full flex-col justify-between border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950/85"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A5B4FC]">
                      Pedido #{p.id} • {p.method === "receipt_upload" ? "Comprovativo" : "Referência"}
                    </p>
                    <p className="mt-2 text-sm text-zinc-200">
                      Curso ID: <span className="font-semibold text-white">{p.course_id}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400 break-all">
                      Usuário: {p.user_id}
                    </p>
                    {p.amount != null && (
                      <p className="mt-2 text-[11px] text-zinc-300">
                        Valor: {Number(p.amount).toLocaleString("pt-AO")} Kz
                      </p>
                    )}
                    {p.reference_code && (
                      <p className="mt-1 text-[11px] text-zinc-300 break-all">
                        Referência: {p.reference_code}
                      </p>
                    )}
                    {p.receipt_path && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-[11px] font-semibold text-[#A5B4FC]">
                          Ver caminho do comprovativo
                        </summary>
                        <p className="mt-1 break-all text-[11px] text-zinc-400">{p.receipt_path}</p>
                      </details>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Button
                      variant="secondary"
                      className="h-10 min-h-10 px-4 text-sm"
                      onClick={() => void reject(p.id)}
                    >
                      Rejeitar
                    </Button>
                    <Button
                      className="h-10 min-h-10 px-4 text-sm"
                      onClick={() => void approve(p.id)}
                    >
                      Aprovar e liberar acesso
                    </Button>
                  </div>
                </Card>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

