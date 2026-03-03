import { create } from "zustand";
import type { AuthUser } from "@/services/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  isHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setHydrated: (value: boolean) => void;
  reset: () => void;
}

const initialState = { user: null, isHydrated: false };

/**
 * Store de autenticação (Zustand).
 * Única responsabilidade: estado do usuário autenticado (SRP).
 */
export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setHydrated: (value) => set({ isHydrated: value }),
  reset: () => set(initialState),
}));
