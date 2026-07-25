"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImgPlaceholder from "@/components/ui/ImgPlaceholder";
import Tag from "@/components/ui/Tag";
import type { NewsItem } from "@/data/news";

// items vêm das notícias publicadas marcadas como "Destaque" (⭐) no /admin/noticias,
// ordenadas pelas mais recentes. Sem nenhuma marcada, o chamador passa um fallback mock.
export default function FeaturedSlider({ items }: { items: NewsItem[] }) {
  const [idx, setIdx] = useState(0);
  const total = items.length;

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(() => setIdx((v) => (v + 1) % total), 6000);
    return () => clearInterval(t);
  }, [total]);

  if (total === 0) return null;

  const goTo = (i: number) => setIdx((i + total) % total);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-md">
      <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {items.map((s) => (
          <Link key={s.slug} href={`/noticia/${s.slug}`} className="min-w-full relative block">
            <ImgPlaceholder icon={s.icon} ratio="21/9" label={s.cat} src={s.image} alt={s.title} />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/85 to-transparent text-white">
              <Tag color={(s.color as "alert" | "highlight" | "green") ?? "primary"} className="mb-1.5">{s.cat}</Tag>
              <h3 className="text-[1.3rem] font-title font-bold">{s.title}</h3>
            </div>
          </Link>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={() => goTo(idx - 1)}
            aria-label="Anterior"
            className="absolute top-1/2 -translate-y-1/2 left-3.5 w-[38px] h-[38px] rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-primary z-10"
          >
            ‹
          </button>
          <button
            onClick={() => goTo(idx + 1)}
            aria-label="Próximo"
            className="absolute top-1/2 -translate-y-1/2 right-3.5 w-[38px] h-[38px] rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-primary z-10"
          >
            ›
          </button>
          <div className="absolute bottom-4 right-5 flex gap-1.5 z-10">
            {items.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-[9px] rounded-full transition-all ${i === idx ? "w-[22px] bg-primary" : "w-[9px] bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
