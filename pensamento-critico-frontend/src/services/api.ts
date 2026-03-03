import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

/**
 * Configuração centralizada do cliente HTTP.
 * Única responsabilidade: instância base e interceptors (SRP).
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
});

/**
 * Interceptor de request: injeta token de autenticação quando existir.
 * Permite trocar a fonte do token sem alterar o restante do código (OCP).
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === "undefined") return config;
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor de response: trata 401 globalmente (opcional).
 * Centraliza lógica de refresh/logout em um único ponto.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      // Redirecionamento pode ser feito aqui ou via store/callback
    }
    return Promise.reject(error);
  }
);
