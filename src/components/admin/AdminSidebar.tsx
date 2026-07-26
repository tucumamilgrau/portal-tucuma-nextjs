"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { group: null, items: [["/admin", "📊 Dashboard"]] },
  {
    group: "Conteúdo",
    items: [
      ["/admin/noticias", "📰 Notícias"],
      ["/admin/categorias", "🗂️ Categorias"],
      ["/admin/autores", "✍️ Autores"],
      ["/admin/midia", "🖼️ Mídia"],
      ["/admin/classificados", "📋 Classificados"],
      ["/admin/videos", "🎥 Vídeos"],
      ["/admin/eventos", "📅 Agenda de Eventos"],
      ["/admin/colunistas", "🖋️ Colunistas & Opinião"],
    ],
  },
  {
    group: "Crescimento",
    items: [
      ["/admin/seo", "🔍 SEO"],
      ["/admin/estatisticas", "📈 Estatísticas"],
      ["/admin/publicidade", "📢 Publicidade"],
    ],
  },
  {
    group: "Comunidade",
    items: [
      ["/admin/comentarios", "💬 Comentários"],
      ["/admin/denuncias", "🚨 Denúncias"],
      ["/admin/usuarios", "👥 Usuários"],
    ],
  },
  {
    group: "Sistema",
    items: [
      ["/admin/ia", "🤖 Inteligência Artificial"],
      ["/admin/seguranca", "🔒 Segurança"],
    ],
  },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block bg-support text-white py-5 w-[230px] shrink-0">
      <div className="px-5 pb-5 border-b border-[#2a2a2a] mb-4">
        <span className="font-title font-extrabold text-[1.1rem]">TUCUMÃ <span className="text-primary">MILGRAU</span></span>
        <div className="text-[0.65rem] text-gray-400 mt-1">Painel Administrativo</div>
      </div>
      <nav>
        {NAV.map((section, i) => (
          <div key={i}>
            {section.group && (
              <div className="text-[0.65rem] uppercase text-gray-600 px-5 pt-4 pb-1.5 tracking-wide">{section.group}</div>
            )}
            {section.items.map(([href, label]) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-2.5 px-5 py-2.5 text-[0.82rem] font-menu ${
                    active ? "bg-primary/15 text-white border-r-[3px] border-primary" : "text-gray-400 hover:bg-primary/15 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
        <Link href="/" className="flex items-center gap-2.5 px-5 py-2.5 text-[0.82rem] font-menu text-gray-400 hover:bg-primary/15 hover:text-white mt-2">
          ↩️ Voltar ao Portal
        </Link>
      </nav>
    </aside>
  );
}
