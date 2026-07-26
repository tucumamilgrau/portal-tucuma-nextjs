"use client";

import { useEffect, useState } from "react";

const EXCHANGE_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL";
const REFRESH_MS = 10 * 60 * 1000; // cotação não muda a cada segundo — 10 min é suficiente

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LiveExchangeRate() {
  const [bid, setBid] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRate() {
      try {
        const res = await fetch(EXCHANGE_URL);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const value = Number(data?.USDBRL?.bid);
        if (!Number.isNaN(value)) setBid(value);
      } catch {
        // API fora do ar — mantém o último valor conhecido em vez de quebrar a barra.
      }
    }

    fetchRate();
    const t = setInterval(fetchRate, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <span className="opacity-90 flex items-center gap-1">
      💵 Dólar {bid !== null ? `R$ ${formatBRL(bid)}` : "..."}
    </span>
  );
}
