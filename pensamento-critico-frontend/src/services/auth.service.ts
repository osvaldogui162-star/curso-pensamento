import { api } from "./api";
import type {
  AuthResponse,
  AuthTokens,
  AuthUser,
  LoginCredentials,
  RegisterPayload,
} from "./types/auth.types";

/**
 * Contrato do serviço de autenticação (DIP).
 * Permite substituir implementação por mock em testes.
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(payload: RegisterPayload): Promise<AuthResponse>;
  logout(): Promise<void>;
  getProfile(): Promise<AuthResponse["user"]>;
}

const AUTH_BASE = "/auth";

/**
 * Serviço de autenticação — única responsabilidade: operações de auth (SRP).
 */
export const authService: IAuthService = {
  async login(credentials) {
    const { data } = await api.post<{ access_token: string; user: any }>(
      `${AUTH_BASE}/login`,
      credentials,
    );

    const tokens: AuthTokens = {
      access_token: data.access_token,
    };

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role ?? "student",
    };

    if (typeof window !== "undefined" && tokens.access_token) {
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }

    return { user, tokens };
  },

  async register(payload) {
    const { data } = await api.post<{ access_token: string; user: any }>(
      `${AUTH_BASE}/register`,
      payload,
    );

    const tokens: AuthTokens = {
      access_token: data.access_token,
    };

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role ?? "student",
    };

    if (typeof window !== "undefined" && tokens.access_token) {
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }

    return { user, tokens };
  },

  async logout() {
    try {
      // Logout no backend é best-effort: se a rede falhar, ainda assim limpamos a sessão local.
      await api.post(`${AUTH_BASE}/logout`).catch(() => undefined);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
      }
    }
  },

  async getProfile() {
    const { data } = await api.get<AuthUser>(`${AUTH_BASE}/me`);
    return data;
  },
};
