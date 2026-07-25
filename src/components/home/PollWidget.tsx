"use client";

import { useEffect, useState } from "react";

const OPTIONS = [
  { key: "sim", label: "Sim, é urgente", pct: 68 },
  { key: "nao", label: "Não, há outras prioridades", pct: 22 },
  { key: "indeciso", label: "Indeciso", pct: 10 },
];

const STORAGE_KEY = "tm_poll_voted";

export default function PollWidget() {
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    // Lido só depois da montagem (não no initializer do useState) para o primeiro
    // render do cliente bater com o HTML vindo do servidor e evitar erro de hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(STORAGE_KEY)) setVoted(true);
  }, []);

  const vote = (key: string) => {
    if (voted) return;
    localStorage.setItem(STORAGE_KEY, key);
    setVoted(true);
  };

  return (
    <div>
      <p className="text-[0.85rem] font-semibold mb-3">A duplicação da PA-279 deve ser prioridade do governo estadual?</p>
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          onClick={() => vote(o.key)}
          className="block w-full text-left mb-2.5 last:mb-0"
        >
          <div className="flex justify-between text-[0.8rem] font-semibold">
            <span>{o.label}</span>
            <span>{o.pct}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden mt-1">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: voted ? `${o.pct}%` : "0%" }}
            />
          </div>
        </button>
      ))}
      <p className="font-menu text-[0.68rem] text-gray-400 mt-2.5">
        1.284 votos {voted ? "· obrigado por votar!" : "· vote clicando numa opção"}
      </p>
    </div>
  );
}
