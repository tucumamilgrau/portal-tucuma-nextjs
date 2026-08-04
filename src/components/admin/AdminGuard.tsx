"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, onAuthChange, watchSessionExpiry } from "@/lib/auth-client";

type Status = "checking" | "denied" | "ok";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const router = useRouter();
  const wasOk = useRef(false);

  useEffect(() => {
    const check = () => {
      const user = getStoredUser();
      if (!user) {
        // Se a sessão já tinha sido validada e sumiu, foi expiração (token de 1h vencido);
        // avisa o usuário em vez de simplesmente jogar de volta pro login sem explicação.
        router.replace(wasOk.current ? "/login?next=/admin&expired=1" : "/login?next=/admin");
        return;
      }
      if (user.role !== "ADMIN") {
        setStatus("denied");
        return;
      }
      wasOk.current = true;
      setStatus("ok");
    };

    check();
    const stopWatch = watchSessionExpiry();
    const unsubscribe = onAuthChange(check);
    return () => {
      stopWatch();
      unsubscribe();
    };
  }, [router]);

  if (status === "checking") {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-400 font-menu text-sm">Verificando sessão...</div>;
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-sm text-center">
          <p className="text-3xl mb-3">🚫</p>
          <h1 className="font-title font-semibold text-lg mb-2">Acesso restrito</h1>
          <p className="text-gray-600 text-sm mb-5">Esta área é exclusiva para administradores do Portal Tucumã Milgrau.</p>
          <Link href="/" className="inline-block bg-primary text-white font-menu font-semibold text-sm px-4 py-2 rounded-full">
            Voltar ao portal
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
