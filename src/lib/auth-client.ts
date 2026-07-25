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

export function loadSession(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
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
