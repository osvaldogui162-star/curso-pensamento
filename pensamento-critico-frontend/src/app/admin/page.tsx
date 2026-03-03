"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { Button, Card, Input } from "@/components/ui";
import { useAuth, useCourses } from "@/hooks";
import { courseService } from "@/services";
import type { Course, Module } from "@/services/types/course.types";

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { courses, status, error, fetchCourses, createCourse, updateCourse, deleteCourse } =
    useCourses();

  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleEditing, setModuleEditing] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", order: 1, pdf_path: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedPdf, setUploadedPdf] = useState<{ name: string; size: number } | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    fetchCourses();
  }, [fetchCourses, router, user]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description,
        price: String(editing.price),
      });
    } else {
      setForm({ name: "", description: "", price: "" });
    }
  }, [editing]);

  useEffect(() => {
    if (!moduleEditing) {
      setModuleForm({ title: "", order: 1, pdf_path: "" });
      setUploadedPdf(null);
    } else {
      setModuleForm({
        title: moduleEditing.title,
        order: moduleEditing.order,
        pdf_path: moduleEditing.pdf_path,
      });
      const prettyName = getPrettyPdfNameFromPath(moduleEditing.pdf_path) ?? "PDF do módulo";
      setUploadedPdf({ name: prettyName, size: 0 });
    }
  }, [moduleEditing]);

  function getPrettyPdfNameFromPath(path: string) {
    const last = path.split("/").pop() ?? "";
    if (!last) return null;
    const parts = last.split("_");
    // formato: <uuid>_<nome-original>.pdf
    if (parts.length <= 1) return last;
    return parts.slice(1).join("_");
  }

  function formatBytes(bytes: number) {
    if (!bytes || bytes <= 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit += 1;
    }
    const fixed = unit === 0 ? 0 : value < 10 ? 1 : 0;
    return `${value.toFixed(fixed)} ${units[unit]}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price.replace(/,/g, "."));
    if (Number.isNaN(price)) return;

    if (editing) {
      await updateCourse(editing.id, {
        name: form.name,
        description: form.description,
        price,
      });
      setEditing(null);
    } else {
      await createCourse({
        name: form.name,
        description: form.description,
        price,
      });
    }
    setForm({ name: "", description: "", price: "" });
  }

  async function handleSelectCourseModules(course: Course) {
    setSelectedCourse(course);
    setModuleEditing(null);
    try {
      const data = await courseService.getByIdWithModules(course.id);
      setModules(data.modules);
    } catch {
      setModules([]);
    }
  }

  async function handleModuleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;

    setUploadError(null);
    if (!moduleForm.pdf_path) {
      setUploadError("Envie o PDF do módulo antes de salvar.");
      return;
    }

    try {
      if (moduleEditing) {
        const updated = await courseService.adminUpdateModule(moduleEditing.id, {
          title: moduleForm.title,
          order: moduleForm.order,
          pdf_path: moduleForm.pdf_path,
        });
        setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setModuleEditing(null);
      } else {
        const created = await courseService.adminCreateModule(selectedCourse.id, {
          title: moduleForm.title,
          order: moduleForm.order,
          pdf_path: moduleForm.pdf_path,
        });
        setModules((prev) => [...prev, created]);
      }

      setModuleForm({ title: "", order: 1, pdf_path: "" });
    } catch (e) {
      const err = e as any;
      setUploadError(
        err?.response?.data?.message ??
          (err instanceof Error ? err.message : "Erro ao salvar módulo. Tente novamente."),
      );
    }
  }

  async function handleDeleteModule(moduleId: number) {
    await courseService.adminDeleteModule(moduleId);
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
  }

  async function handlePdfFile(file: File) {
    setUploadError(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Apenas arquivos PDF são permitidos.");
      return;
    }
    try {
      setUploading(true);
      setUploadedPdf({ name: file.name, size: file.size });
      const { path } = await courseService.adminUploadModulePdf(file);
      setModuleForm((f) => ({ ...f, pdf_path: path }));
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Não foi possível enviar o PDF. Tente novamente.",
      );
    } finally {
      setUploading(false);
    }
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
              Gestão de cursos
            </h1>
          </div>
          <Button variant="secondary" onClick={() => logout()}>
            Sair
          </Button>
        </header>

        <Card className="border-[#15094A]/40 bg-zinc-950/80 shadow-2xl shadow-black/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A5B4FC]">
                Validação de pagamentos
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                Analise pedidos pendentes e libere o acesso ao curso com 1 clique.
              </p>
            </div>
            <Button
              variant="secondary"
              className="h-10 min-h-10 px-4 text-sm"
              onClick={() => router.push("/admin/payments")}
            >
              Ver pagamentos pendentes
            </Button>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
          {/* Formulário de curso */}
          <Card className="border-[#15094A]/50 bg-zinc-950/90 shadow-2xl shadow-black/70">
            <h2 className="text-sm font-semibold text-zinc-50">
              {editing ? "Editar curso" : "Novo curso"}
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Preencha os dados abaixo para {editing ? "atualizar" : "cadastrar"} um curso.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 text-sm">
              <Input
                label="Nome do curso"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-200">Descrição</label>
                <textarea
                  className="min-h-[80px] rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-[#15094A] focus:ring-2 focus:ring-[#15094A]/40"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Resumo do conteúdo do curso"
                />
              </div>
              <Input
                label="Preço (Kz)"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />

              {error && (
                <p className="text-xs text-red-400" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-2 flex items-center justify-between gap-3">
                {editing && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(null)}
                  >
                    Cancelar edição
                  </Button>
                )}
                <div className="ml-auto flex gap-2">
                  <Button type="submit" size="sm" disabled={status === "loading"}>
                    {status === "loading"
                      ? "Salvando…"
                      : editing
                      ? "Atualizar curso"
                      : "Criar curso"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Lista de cursos */}
          <Card className="border-[#15094A]/40 bg-zinc-950/80 shadow-2xl shadow-black/70">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-zinc-50">Cursos cadastrados</h2>
              <span className="text-xs text-zinc-400">
                {status === "loading"
                  ? "Carregando cursos…"
                  : `${courses.length} curso${courses.length === 1 ? "" : "s"}`}
              </span>
            </div>

            {status === "loading" && (
              <p className="text-sm text-zinc-400">Carregando…</p>
            )}
            {status === "error" && error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            {status === "idle" && courses.length === 0 && (
              <p className="text-sm text-zinc-400">
                Nenhum curso cadastrado ainda. Use o formulário ao lado para criar o primeiro curso.
              </p>
            )}
            {status === "idle" && courses.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2">
                {courses.map((course) => (
                  <Card
                    as="li"
                    key={course.id}
                    className="flex h-full flex-col justify-between border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950/85"
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A5B4FC]">
                        Curso #{course.id}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-zinc-50">
                        {course.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
                        {course.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2 text-xs text-zinc-400">
                      <span className="rounded-full bg-[#15094A]/20 px-3 py-1 text-[11px] font-medium text-[#E5E7EB]">
                        {course.price.toLocaleString("pt-AO")} Kz
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          onClick={() => setEditing(course)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="xs"
                          onClick={() => deleteCourse(course.id)}
                        >
                          Remover
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          onClick={() => handleSelectCourseModules(course)}
                        >
                          Módulos
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Gestão de módulos do curso selecionado */}
        {selectedCourse && (
          <Card className="border-[#15094A]/40 bg-zinc-950/85 shadow-2xl shadow-black/70">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A5B4FC]">
                  Módulos do curso
                </p>
                <h2 className="mt-1 text-lg font-medium text-zinc-50">
                  {selectedCourse.name}
                </h2>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedCourse(null);
                  setModules([]);
                  setModuleEditing(null);
                }}
              >
                Fechar gestão de módulos
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
              <form
                onSubmit={handleModuleSubmit}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 text-sm"
              >
                <h3 className="text-sm font-semibold text-zinc-50">
                  {moduleEditing ? "Editar módulo" : "Novo módulo"}
                </h3>
                <Input
                  label="Título do módulo"
                  value={moduleForm.title}
                  onChange={(e) =>
                    setModuleForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
                <Input
                  label="Ordem"
                  type="number"
                  min={1}
                  value={moduleForm.order}
                  onChange={(e) =>
                    setModuleForm((f) => ({
                      ...f,
                      order: Number(e.target.value) || 1,
                    }))
                  }
                  required
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-200">
                    PDF do módulo (arraste e solte ou clique)
                  </label>
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/60 px-3 py-4 text-xs text-zinc-400 hover:border-[#15094A] hover:bg-zinc-900/80"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        void handlePdfFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => {
                      const input = document.getElementById(
                        "module-pdf-input",
                      ) as HTMLInputElement | null;
                      input?.click();
                    }}
                  >
                    {!uploadedPdf && !uploading && !uploadError && (
                      <p className="text-[11px]">
                        Solte aqui o arquivo PDF do módulo ou clique para selecionar.
                      </p>
                    )}

                    {(uploadedPdf || uploading || uploadError) && (
                      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#15094A]/60 bg-[#15094A]/15">
                            <span className="text-[11px] font-semibold text-zinc-100">PDF</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-semibold text-zinc-100">
                              {uploadedPdf?.name ?? "PDF do módulo"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-zinc-400">
                              {uploadedPdf?.size ? formatBytes(uploadedPdf.size) : "Arquivo enviado para o storage"}
                            </p>
                            {uploading && (
                              <p className="mt-1 text-[11px] text-zinc-400">
                                Enviando PDF…
                              </p>
                            )}
                            {!uploading && moduleForm.pdf_path && !uploadError && (
                              <p className="mt-1 text-[11px] text-emerald-300">
                                Upload concluído. Pronto para salvar o módulo.
                              </p>
                            )}
                            {uploadError && (
                              <p className="mt-1 text-[11px] text-red-400">
                                {uploadError}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col gap-2">
                            {moduleForm.pdf_path && (
                              <button
                                type="button"
                                className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-2 py-1 text-[11px] font-semibold text-zinc-200 hover:border-[#15094A] hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModuleForm((f) => ({ ...f, pdf_path: "" }));
                                  setUploadedPdf(null);
                                  setUploadError(null);
                                }}
                              >
                                Remover
                              </button>
                            )}
                            <button
                              type="button"
                              className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-2 py-1 text-[11px] font-semibold text-zinc-200 hover:border-[#15094A] hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                const input = document.getElementById(
                                  "module-pdf-input",
                                ) as HTMLInputElement | null;
                                input?.click();
                              }}
                            >
                              Trocar
                            </button>
                          </div>
                        </div>

                        {moduleForm.pdf_path && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-[11px] font-semibold text-[#A5B4FC]">
                              Ver detalhes técnicos
                            </summary>
                            <p className="mt-1 break-all text-[11px] text-zinc-400">
                              {moduleForm.pdf_path}
                            </p>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    id="module-pdf-input"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void handlePdfFile(file);
                      }
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  {moduleEditing && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setModuleEditing(null)}
                    >
                      Cancelar edição
                    </Button>
                  )}
                  <Button type="submit" size="sm" className="ml-auto">
                    {moduleEditing ? "Atualizar módulo" : "Adicionar módulo"}
                  </Button>
                </div>
              </form>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4">
                {modules.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Nenhum módulo cadastrado para este curso ainda.
                  </p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {modules.map((module) => (
                      <Card
                        as="li"
                        key={module.id}
                        className="flex h-full flex-col justify-between border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950/85"
                      >
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A5B4FC]">
                            Módulo {module.order}
                          </p>
                          <h4 className="mt-1 text-sm font-semibold text-zinc-50">
                            {module.title}
                          </h4>
                          <p className="mt-1 text-[11px] text-zinc-400 break-all">
                            {module.pdf_path}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-400">
                          <span>ID #{module.id}</span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="xs"
                              onClick={() => setModuleEditing(module)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              size="xs"
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

