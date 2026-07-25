"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "s1", label: "O anúncio" },
  { id: "s2", label: "Cronograma das obras" },
  { id: "s3", label: "Impacto econômico" },
  { id: "s4", label: "Reação da população" },
  { id: "s5", label: "Próximos passos" },
];

export default function ArticleToc() {
  const [active, setActive] = useState("s1");

  useEffect(() => {
    const onScroll = () => {
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && window.scrollY >= el.offsetTop - 140) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="hidden xl:block sticky top-[180px] text-[0.8rem]">
      <h5 className="font-menu uppercase text-[0.7rem] text-gray-400 mb-2.5">Índice</h5>
      <ul className="space-y-2">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`block pl-2.5 border-l-2 ${active === s.id ? "text-primary border-primary" : "text-gray-600 border-gray-200"}`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
