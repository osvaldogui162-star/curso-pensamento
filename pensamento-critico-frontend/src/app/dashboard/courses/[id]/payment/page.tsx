"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/hooks";
import { bankDetails } from "@/config/bank";
import { courseService, paymentService } from "@/services";

type Method = "receipt_upload" | "reference";

export default function CoursePaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, logout } = useAuth();

  const courseId = useMemo(() => Number(params.id), [params.id]);
  const [courseName, setCourseName] = useState<string>("Curso");
  const [price, setPrice] = useState<number | null>(null);

  const [method, setMethod] = useState<Method>("receipt_upload");
  const [receipt, setReceipt] = useState<{ name: string; size: number; path: string } | null>(null);
  const [referenceCode, setReferenceCode] = useState("");
  const [note, setNote] = useState("");

  const [status, setStatus] = useState<"idle" | "uploading" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!courseId || Number.isNaN(courseId)) return;

    async function load() {
      try {
        const result = await courseService.getByIdWithModules(courseId);
        setCourseName(result.course.name);
        setPrice(result.course.price);
      } catch {
        // fallback
      }
    }

    load();
  }, [courseId, router, user]);

  function formatBytes(bytes: number) {
    const units = ["B", "KB", "MB", "GB"];
    let v = bytes;
    let u = 0;
    while (v >= 1024 && u < units.length - 1) {
      v /= 1024;
      u += 1;
    }
    return `${v.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
  }

  async function handleReceiptFile(file: File) {
    setError(null);
    setStatus("uploading");
    try {
      const { path } = await paymentService.uploadReceipt(file);
      setReceipt({ name: file.name, size: file.size, path });
      setStatus("idle");
    } catch (e) {
      const err = e as any;
      setError(err?.response?.data?.message ?? (e instanceof Error ? e.message : "Falha no upload."));
      setStatus("error");
    }
  }

  async function handleSubmit() {
    setError(null);
    setStatus("sending");
    try {
      if (method === "receipt_upload" && !receipt?.path) {
        setError("Envie o comprovativo antes de enviar.");
        setStatus("idle");
        return;
      }
      if (method === "reference" && !referenceCode.trim()) {
        setError("Informe a referência do pagamento.");
        setStatus("idle");
        return;
      }

      await paymentService.createRequest({
        course_id: courseId,
        method,
        receipt_path: method === "receipt_upload" ? receipt?.path : undefined,
        reference_code: method === "reference" ? referenceCode.trim() : undefined,
        note: note.trim() || undefined,
      });

      setStatus("done");
    } catch (e) {
      const err = e as any;
      setError(
        err?.response?.data?.message ??
          (e instanceof Error ? e.message : "Não foi possível enviar seu pedido."),
      );
      setStatus("error");
    }
  }

  return (
    <MainLayout user={user ?? undefined}>
      <div className="flex flex-col gap-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A5B4FC]">
              Pagamento e validação
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Ativar acesso ao curso
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Curso: <span className="font-medium text-zinc-200">{courseName}</span>
              {price != null ? (
                <>
                  {" "}
                  • Valor:{" "}
                  <span className="font-semibold text-zinc-50">
                    {price.toLocaleString("pt-AO")} Kz
                  </span>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push(`/dashboard/courses/${courseId}`)}>
              Voltar
            </Button>
            <Button variant="secondary" onClick={() => logout()}>
              Sair
            </Button>
          </div>
        </header>

        <Card className="relative overflow-hidden border-[#15094A]/40 bg-zinc-950/80 shadow-2xl shadow-black/70">
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-[#15094A]/40 blur-3xl" />
            <div className="absolute -right-14 bottom-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" />
          </div>
          <div className="relative z-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">Dados bancários</h2>
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                <p><span className="text-zinc-400">Empresa:</span> {bankDetails.companyName}</p>
                <p><span className="text-zinc-400">Banco:</span> {bankDetails.bankName}</p>
                <p><span className="text-zinc-400">Titular:</span> {bankDetails.accountName}</p>
                <p><span className="text-zinc-400">IBAN:</span> {bankDetails.iban}</p>
                <p><span className="text-zinc-400">Conta:</span> {bankDetails.accountNumber}</p>
                <p><span className="text-zinc-400">SWIFT:</span> {bankDetails.swift}</p>
              </div>
              <p className="mt-4 text-xs text-zinc-400">{bankDetails.notes}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-zinc-50">Enviar confirmação</h2>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className={[
                    "rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                    method === "receipt_upload"
                      ? "border-[#15094A] bg-[#15094A]/20 text-white"
                      : "border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-[#15094A]",
                  ].join(" ")}
                  onClick={() => setMethod("receipt_upload")}
                >
                  Comprovativo (upload)
                </button>
                <button
                  type="button"
                  className={[
                    "rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                    method === "reference"
                      ? "border-[#15094A] bg-[#15094A]/20 text-white"
                      : "border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-[#15094A]",
                  ].join(" ")}
                  onClick={() => setMethod("reference")}
                >
                  Pagamento por referência
                </button>
              </div>

              {method === "receipt_upload" ? (
                <div className="mt-4" key="receipt_upload">
                  <div
                    className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/60 p-4 text-xs text-zinc-300 hover:border-[#15094A]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) void handleReceiptFile(f);
                    }}
                    onClick={() => {
                      receiptInputRef.current?.click();
                    }}
                  >
                    {!receipt ? (
                      <p>Arraste e solte o comprovativo (PDF/PNG/JPG) ou clique para selecionar.</p>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[12px] font-semibold text-zinc-100">{receipt.name}</p>
                          <p className="mt-1 text-[11px] text-zinc-400">{formatBytes(receipt.size)}</p>
                          <p className="mt-1 text-[11px] text-emerald-300">Upload concluído.</p>
                        </div>
                        <Button
                          variant="secondary"
                          className="h-10 min-h-10 px-4 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceipt(null);
                            if (receiptInputRef.current) receiptInputRef.current.value = "";
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    )}
                    {status === "uploading" && <p className="mt-2 text-[11px] text-zinc-400">Enviando…</p>}
                    {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
                  </div>
                  <input
                    id="receipt-input"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    className="hidden"
                    ref={receiptInputRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleReceiptFile(f);
                    }}
                  />
                </div>
              ) : (
                <div className="mt-4" key="reference">
                  <label className="text-xs font-semibold text-zinc-300">Referência</label>
                  <input
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 text-sm text-zinc-100 outline-none focus:border-[#15094A] focus:ring-2 focus:ring-[#15094A]/40"
                    placeholder="Ex.: REF-2026-000123"
                  />
                </div>
              )}

              <div className="mt-4">
                <label className="text-xs font-semibold text-zinc-300">Observação (opcional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-2 min-h-[72px] w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#15094A] focus:ring-2 focus:ring-[#15094A]/40"
                  placeholder="Ex.: paguei via transferência às 14h30."
                />
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-[11px] text-zinc-400">
                  Após enviar, um admin valida e libera o acesso.
                </span>
                <Button
                  className="h-10 min-h-10 px-5 text-sm"
                  disabled={status === "sending" || status === "uploading"}
                  onClick={() => void handleSubmit()}
                >
                  {status === "sending" ? "Enviando…" : status === "done" ? "Enviado" : "Enviar para validação"}
                </Button>
              </div>
              {status === "done" && (
                <p className="mt-3 text-sm text-emerald-300">
                  Pedido enviado com sucesso. Assim que for aprovado, seu acesso será liberado.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

