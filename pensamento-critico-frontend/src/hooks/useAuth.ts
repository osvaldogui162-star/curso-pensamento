"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services";
import { useAuthStore } from "@/stores";

/**
 * Hook de autenticação: encapsula login, register, logout e estado (SRP).
 * Padrão: Custom Hook que delega para service + store.
 */
export function useAuth() {
  const router = useRouter();
  const { user, setUser, reset } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u } = await authService.login({ email, password });
      setUser(u);
      if (u.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    },
    [router, setUser]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user: u } = await authService.register({ name, email, password });
      setUser(u);
      if (u.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    },
    [router, setUser]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    reset();
    router.push("/");
  }, [router, reset]);

  return { user, login, register, logout };
}
