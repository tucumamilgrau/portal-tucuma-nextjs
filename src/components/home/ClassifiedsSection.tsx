"use client";

import { useState } from "react";
import ImgPlaceholder from "@/components/ui/ImgPlaceholder";
import { resolveMediaUrl, type ApiClassified } from "@/lib/api";

const FILTERS = ["Todos", "Empregos", "Imóveis", "Veículos", "Serviços"];

export default function ClassifiedsSection({ items }: { items: ApiClassified[] }) {
  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? items : items.filter((c) => c.category === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-[18px]">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-menu text-[0.72rem] font-semibold px-3.5 py-1.5 rounded-full border-[1.5px] ${
              filter === f ? "bg-support text-white border-support" : "bg-white border-gray-200 hover:bg-support hover:text-white hover:border-support"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-[0.85rem] text-center py-8">Nenhum classificado nessa categoria no momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <ImgPlaceholder icon={c.icon} ratio="4/3" src={resolveMediaUrl(c.imageUrl)} alt={c.title} />
              <div className="p-3.5">
                <span className="inline-block font-menu font-bold text-[0.68rem] uppercase border-[1.5px] border-primary text-primary px-2.5 py-1 rounded">{c.category}</span>
                <h4 className="text-[0.9rem] font-semibold my-2">{c.title}</h4>
                <div className="text-primary font-title font-bold">{c.price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
