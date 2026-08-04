"use client";

import type { AuthResponse, AuthUser } from "./api";

const STORAGE_KEY = "tm_auth";
const AUTH_EVENT = "tm-auth-change";

export function saveSession(auth: AuthResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function loadSession(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const auth = JSON.parse(raw) as AuthResponse;
    const expiresAt = getTokenExpiry(auth.token);
    if (expiresAt !== null && Date.now() >= expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(AUTH_EVENT));
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

/** Verifica periodicamente se a sessão expirou (token JWT vencido) e limpa
 * o localStorage automaticamente, mesmo sem nenhuma requisição à API. */
export function watchSessionExpiry(intervalMs = 30_000): () => void {
  const id = window.setInterval(() => {
    loadSession();
  }, intervalMs);
  return () => window.clearInterval(id);
}

export function getStoredUser(): AuthUser | null {
  return loadSession()?.user ?? null;
}

export function getToken(): string | null {
  return loadSession()?.token ?? null;
}

/** Componentes (ex.: Header) chamam isto para reagir a login/logout feitos em outra parte da árvore. */
export function onAuthChange(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
