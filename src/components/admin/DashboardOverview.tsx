"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetStats, adminListComments, formatViews, type ApiStats, type ApiAdminComment } from "@/lib/api";
import { getToken } from "@/lib/auth-client";

export default function DashboardOverview() {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [pending, setPending] = useState<ApiAdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [s, p] = await Promise.all([adminGetStats(token), adminListComments(token, "pending")]);
        setStats(s);
        setPending(p.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar o dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) return <p className="text-gray-400 text-[0.85rem] mb-6">Carregando estatísticas...</p>;
  if (error) return <p className="text-alert text-[0.85rem] mb-6">{error}</p>;
  if (!stats) return null;

  const maxCategoryViews = Math.max(1, ...stats.viewsByCategory.map((c) => c.views));
  const maxDayCount = Math.max(1, ...stats.publishedLast7Days.map((d) => d.count));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-[18px]">
          <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Visualizações totais</div>
          <div className="font-title text-[1.7rem] font-bold my-1.5">{formatViews(stats.totalViews)}</div>
          <div className="text-[0.75rem] font-semibold text-gray-400">notícias publicadas</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-[18px]">
          <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Publicadas</div>
          <div className="font-title text-[1.7rem] font-bold my-1.5">{stats.byStatus.PUBLISHED}</div>
          <div className="text-[0.75rem] font-semibold text-green-600">no ar agora</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-[18px]">
          <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Rascunhos</div>
          <div className="font-title text-[1.7rem] font-bold my-1.5">{stats.byStatus.DRAFT}</div>
          <div className="text-[0.75rem] font-semibold text-gray-400">aguardando revisão</div>
        </div>
        <Link href="/admin/comentarios" className="bg-white rounded-xl shadow-sm p-[18px] hover:shadow-md transition-shadow">
          <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Comentários pendentes</div>
          <div className="font-title text-[1.7rem] font-bold my-1.5">{pending.length}{pending.length === 5 ? "+" : ""}</div>
          <div className="text-[0.75rem] font-semibold text-primary">ver fila →</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-xl shadow-sm p-5 max-w-full">
          <h3 className="text-[1rem] font-title font-semibold mb-4">Visualizações por Editoria</h3>
          <div className="w-full overflow-x-auto">
            <div className="flex items-end gap-2 h-[140px] min-w-[420px] pb-[22px]">
              {stats.viewsByCategory.map((c) => (
                <div
                  key={c.category}
                  className="flex-1 relative bg-gradient-to-t from-primary to-[#FDBA74] rounded-t"
                  style={{ height: `${Math.max(4, (c.views / maxCategoryViews) * 100)}%` }}
                >
                  <span className="absolute -bottom-5 left-0 right-0 text-center text-[0.65rem] text-gray-400 break-words leading-tight">
                    {c.category}
                  </span>
                </div>
              ))}
              {stats.viewsByCategory.length === 0 && <p className="text-gray-400 text-[0.8rem]">Sem dados ainda.</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 max-w-full">
          <h3 className="text-[1rem] font-title font-semibold mb-4">Publicações nos últimos 7 dias</h3>
          <div className="w-full overflow-x-auto">
            <div className="flex items-end gap-2 h-[140px] min-w-[300px] pb-[22px]">
              {stats.publishedLast7Days.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 relative bg-gradient-to-t from-support to-highlight rounded-t"
                  style={{ height: `${Math.max(4, (d.count / maxDayCount) * 100)}%` }}
                >
                  <span className="absolute -top-5 left-0 right-0 text-center text-[0.65rem] font-semibold">{d.count}</span>
                  <span className="absolute -bottom-5 left-0 right-0 text-center text-[0.62rem] text-gray-400">
                    {new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          ["📰", "Notícias", "/admin/noticias"],
          ["🗂️", "Categorias", "/admin/categorias"],
          ["✍️", "Autores", "/admin/autores"],
          ["🖼️", "Mídia", "/admin/midia"],
          ["💬", "Comentários", "/admin/comentarios"],
          ["📢", "Publicidade", "/admin/publicidade"],
        ].map(([icon, label, href]) => (
          <Link key={href} href={href} className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md hover:text-primary transition-shadow">
            <div className="text-[1.4rem] mb-1">{icon}</div>
            <div className="text-[0.75rem] font-menu font-semibold">{label}</div>
          </Link>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 max-w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[1rem] font-title font-semibold">Comentários pendentes de revisão</h3>
            <Link href="/admin/comentarios" className="text-primary font-menu font-semibold text-[0.78rem]">Ver todos →</Link>
          </div>
          <ul className="space-y-2.5">
            {pending.map((c) => (
              <li key={c.id} className="text-[0.82rem] border-b border-gray-100 pb-2.5 last:border-0">
                <span className="font-semibold">{c.authorName}</span> em <span className="text-gray-500">{c.news.title}</span>
                <p className="text-gray-600 mt-0.5">&quot;{c.text}&quot;</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
