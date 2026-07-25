"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminListNews, type ApiNews } from "@/lib/api";
import { getToken } from "@/lib/auth-client";

type Issue = { label: string; severity: "warn" | "error" };

function analyze(news: ApiNews): Issue[] {
  const issues: Issue[] = [];
  if (news.title.length < 20) issues.push({ label: "Título muito curto (ideal: 20–70 caracteres)", severity: "warn" });
  if (news.title.length > 70) issues.push({ label: "Título muito longo (ideal: 20–70 caracteres)", severity: "warn" });
  if (!news.excerpt || news.excerpt.length < 50) issues.push({ label: "Resumo ausente ou muito curto (ideal: 50+ caracteres, usado em compartilhamentos)", severity: "error" });
  if (!news.coverImage) issues.push({ label: "Sem foto de capa — só emoji, prejudica compartilhamento em redes sociais", severity: "warn" });
  if (!news.subtitle) issues.push({ label: "Sem subtítulo", severity: "warn" });
  if (!news.body || news.body.length < 200) issues.push({ label: "Corpo da matéria muito curto (menos de 200 caracteres)", severity: "warn" });
  return issues;
}

export default function SeoChecklist() {
  const [news, setNews] = useState<ApiNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setNews(await adminListNews(token));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar as notícias.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) return <p className="text-gray-400 text-[0.85rem]">Carregando...</p>;
  if (error) return <p className="text-alert text-[0.85rem]">{error}</p>;

  const analyzed = news.map((n) => ({ news: n, issues: analyze(n) })).sort((a, b) => b.issues.length - a.issues.length);
  const withIssues = analyzed.filter((a) => a.issues.length > 0);
  const clean = analyzed.length - withIssues.length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-5 max-w-full">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-[1rem] font-title font-semibold">Checklist de SEO</h3>
        <span className="text-[0.78rem] text-gray-500">{clean} de {analyzed.length} notícias sem pendências</span>
      </div>

      {withIssues.length === 0 ? (
        <p className="text-green-600 text-[0.85rem] text-center py-8">✅ Nenhuma pendência de SEO encontrada.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
                <th className="p-2.5">Notícia</th><th className="p-2.5">Status</th><th className="p-2.5">Pendências</th><th className="p-2.5">Ação</th>
              </tr>
            </thead>
            <tbody>
              {withIssues.map(({ news: n, issues }) => (
                <tr key={n.id} className="border-b border-gray-100 align-top">
                  <td className="p-2.5 max-w-[220px]">{n.title}</td>
                  <td className="p-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${issues.some((i) => i.severity === "error") ? "bg-red-100 text-alert" : "bg-amber-100 text-amber-700"}`}>
                      {issues.some((i) => i.severity === "error") ? "Crítico" : "Atenção"}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
                      {issues.map((i) => <li key={i.label}>{i.label}</li>)}
                    </ul>
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    <Link href="/admin/noticias" className="text-primary font-menu font-semibold text-[0.75rem]">Editar →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
