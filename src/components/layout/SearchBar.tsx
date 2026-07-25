"use client";

import { useState } from "react";
import { REGIONS, CATEGORIES } from "@/data/news";

export default function SearchBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="hidden lg:flex items-center gap-1.5 font-menu font-semibold text-[0.78rem] py-3 px-1"
      >
        🔍 Pesquisa Inteligente
      </button>

      {open && (
        <div className="bg-gray-100 border-t border-gray-200">
          <div className="max-w-[1280px] mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_repeat(4,1fr)_auto] gap-2.5">
              <input type="text" placeholder="Buscar por palavra-chave..." className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.82rem] bg-white" />
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.82rem] bg-white">
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.82rem] bg-white">
                <option>Categoria</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="date" className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.82rem] bg-white" />
              <input type="text" placeholder="Autor" className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.82rem] bg-white" />
              <button className="font-menu font-semibold text-[0.85rem] bg-primary text-white px-4.5 py-2.5 rounded-full hover:bg-primary-dark">Buscar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
