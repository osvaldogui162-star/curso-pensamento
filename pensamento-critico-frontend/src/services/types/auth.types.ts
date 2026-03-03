/**
 * Tipos de domínio para autenticação.
 * Mantidos em arquivo separado para reuso e single source of truth (SRP).
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  name: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
