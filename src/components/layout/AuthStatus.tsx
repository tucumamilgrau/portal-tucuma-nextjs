"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/api";
import { getStoredUser, clearSession, onAuthChange } from "@/lib/auth-client";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export default function AuthStatus() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Lido só depois da montagem para o primeiro render do cliente bater com o
    // HTML do servidor (que não tem acesso ao localStorage) e evitar mismatch de hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getStoredUser());
    return onAuthChange(() => setUser(getStoredUser()));
  }, []);

  if (!user) {
    return (
      <Link href="/login" aria-label="Entrar" className="w-[38px] h-[38px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary/10">
        👤
      </Link>
    );
  }

  const logout = () => {
    clearSession();
    setOpen(false);
    router.push("/");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-[38px] h-[38px] rounded-full bg-primary text-white font-title font-bold text-[0.8rem] flex items-center justify-center"
        aria-label={`Conta de ${user.name}`}
      >
        {initials(user.name)}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[46px] w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-[0.85rem] font-semibold truncate">{user.name}</p>
              <p className="text-[0.72rem] text-gray-400 truncate">{user.email}</p>
            </div>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-[0.82rem] text-support hover:bg-gray-50"
              >
                ⚙️ Painel Administrativo
              </Link>
            )}
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2.5 text-[0.82rem] text-alert hover:bg-gray-50"
            >
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
