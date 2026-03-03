"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Input, Card } from "@/components/ui";
import { useAuth } from "@/hooks";
import { AuthShell } from "@/components/auth/AuthShell";

/**
 * Página de registro. Responsabilidade: formulário de criação de conta (SRP).
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no registro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md bg-zinc-950/85 text-zinc-50 backdrop-blur-sm border-[#15094A]">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-50">
          Criar conta
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            required
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Criando conta…" : "Criar conta"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-300">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-zinc-100 underline">
            Entrar
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
