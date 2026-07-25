"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "@/lib/auth-client";

export default function AdminGreeting() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura de localStorage só é segura após montar no cliente
    setName(getStoredUser()?.name ?? null);
  }, []);

  const today = new Date().toLocaleDateString("pt-BR");
  return <p className="text-[0.8rem] text-gray-400">Bem-vinda de volta{name ? `, ${name}` : ""} · {today}</p>;
}
