"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth-client";

type Status = "checking" | "denied" | "ok";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }
    if (user.role !== "ADMIN") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- verificação de sessão só pode ocorrer após montar no cliente
      setStatus("denied");
      return;
    }
    setStatus("ok");
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
