"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Input, Card } from "@/components/ui";
import { useAuth } from "@/hooks";
import { AuthShell } from "@/components/auth/AuthShell";

/**
 * Página de login. Responsabilidade: formulário e fluxo de autenticação (SRP).
 */
export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md bg-zinc-950/85 text-zinc-50 backdrop-blur-sm border-[#15094A]">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-50">
          Entrar
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-300">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-zinc-100 underline">
            Criar conta
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
