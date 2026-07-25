"use client";

import { useState } from "react";
import Link from "next/link";
import { categoryHref } from "@/lib/categories";

const LINKS = [
  ["/", "Início"],
  ["/#ultimas", "Últimas Notícias"],
  [categoryHref("Política"), "Política"],
  [categoryHref("Polícia"), "Polícia"],
  [categoryHref("Economia"), "Economia"],
  [categoryHref("Agronegócio"), "Agronegócio"],
  [categoryHref("Esportes"), "Esportes"],
  [categoryHref("Saúde"), "Saúde"],
  [categoryHref("Educação"), "Educação"],
  [categoryHref("Entretenimento"), "Entretenimento"],
  [categoryHref("Tecnologia"), "Tecnologia"],
  [categoryHref("Brasil"), "Brasil"],
  [categoryHref("Mundo"), "Mundo"],
  ["/#colunistas", "Colunistas"],
  ["/#videos", "Vídeos"],
  ["/#classificados", "Classificados"],
  ["/login", "Área do Leitor"],
  ["/admin", "Painel Administrativo"],
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="lg:hidden w-[38px] h-[38px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary/10"
      >
        ☰
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/50 z-[99] transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <aside
        className={`fixed inset-y-0 right-0 w-[min(320px,86vw)] h-screen bg-white z-[100] overflow-y-auto shadow-2xl transition-transform duration-250 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="font-title font-extrabold">Menu</span>
          <button onClick={() => setOpen(false)} className="w-[38px] h-[38px] rounded-full bg-gray-100 flex items-center justify-center">✕</button>
        </div>
        <ul>
          {LINKS.map(([href, label]) => (
            <li key={label} className="border-b border-gray-100">
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="block px-5 py-3.5 font-menu font-semibold text-[0.85rem] uppercase hover:text-primary hover:bg-gray-50"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
