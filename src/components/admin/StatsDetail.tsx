"use client";

import { useEffect, useState } from "react";
import { adminGetStats, formatViews, type ApiStats } from "@/lib/api";
import { getToken } from "@/lib/auth-client";

export default function StatsDetail() {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setStats(await adminGetStats(token));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar as estatísticas.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) return <p className="text-gray-400 text-[0.85rem]">Carregando...</p>;
  if (error) return <p className="text-alert text-[0.85rem]">{error}</p>;
  if (!stats) return null;

  const totalPublished7d = stats.publishedLast7Days.reduce((sum, d) => sum + d.count, 0);
  const totalCategoryViews = stats.viewsByCategory.reduce((sum, c) => sum + c.views, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-[18px]">
          <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Visualizações totais</div>
          <div className="font-title text-[1.7rem] font-bold my-1.5">{formatViews(stats.totalViews)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-[18px]">
          <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Publicadas / Rascunhos / Agendadas</div>
          <div className="font-title text-[1.4rem] font-bold my-1.5">{stats.byStatus.PUBLISHED} / {stats.byStatus.DRAFT} / {stats.byStatus.SCHEDULED}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-[18px]">
          <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Publicações (últimos 7 dias)</div>
          <div className="font-title text-[1.7rem] font-bold my-1.5">{totalPublished7d}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 max-w-full">
        <h3 className="text-[1rem] font-title font-semibold mb-4">Visualizações por categoria</h3>
        <table className="w-full border-collapse text-[0.82rem]">
          <thead>
            <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
              <th className="p-2.5">Categoria</th><th className="p-2.5">Visualizações</th><th className="p-2.5">% do total</th>
            </tr>
          </thead>
          <tbody>
            {stats.viewsByCategory.map((c) => (
              <tr key={c.category} className="border-b border-gray-100">
                <td className="p-2.5">{c.category}</td>
                <td className="p-2.5">{formatViews(c.views)}</td>
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
                      <div className="h-full bg-primary" style={{ width: `${totalCategoryViews ? (c.views / totalCategoryViews) * 100 : 0}%` }} />
                    </div>
                    <span className="text-gray-500 text-[0.72rem]">{totalCategoryViews ? ((c.views / totalCategoryViews) * 100).toFixed(0) : 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {stats.viewsByCategory.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-gray-400">Sem dados ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 max-w-full">
        <h3 className="text-[1rem] font-title font-semibold mb-4">Publicações por dia (últimos 7 dias)</h3>
        <table className="w-full border-collapse text-[0.82rem]">
          <thead>
            <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
              <th className="p-2.5">Data</th><th className="p-2.5">Notícias publicadas</th>
            </tr>
          </thead>
          <tbody>
            {stats.publishedLast7Days.map((d) => (
              <tr key={d.date} className="border-b border-gray-100">
                <td className="p-2.5">{new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                <td className="p-2.5">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
