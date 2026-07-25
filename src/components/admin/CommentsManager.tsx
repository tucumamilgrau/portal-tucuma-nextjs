"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminListComments, adminSetCommentApproved, adminDeleteComment, type ApiAdminComment } from "@/lib/api";
import { getToken } from "@/lib/auth-client";

type Filter = "all" | "pending" | "flagged";

const FILTER_LABEL: Record<Filter, string> = { all: "Todos", pending: "Pendentes", flagged: "Denunciados/Sinalizados" };

export default function CommentsManager({ initialFilter = "all", title = "Moderação de Comentários" }: { initialFilter?: Filter; title?: string }) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [comments, setComments] = useState<ApiAdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const token = getToken();

  const reload = async (f: Filter) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setComments(await adminListComments(token, f));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os comentários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const approve = async (c: ApiAdminComment) => {
    if (!token) return;
    setBusyId(c.id);
    try {
      await adminSetCommentApproved(token, c.id, true);
      await reload(filter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível aprovar.");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (c: ApiAdminComment) => {
    if (!token) return;
    setBusyId(c.id);
    try {
      await adminSetCommentApproved(token, c.id, false);
      await reload(filter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível reprovar.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (c: ApiAdminComment) => {
    if (!token) return;
    if (!confirm(`Excluir permanentemente o comentário de "${c.authorName}"?`)) return;
    setBusyId(c.id);
    try {
      await adminDeleteComment(token, c.id);
      await reload(filter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-5 max-w-full">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-[1rem] font-title font-semibold">{title}</h3>
        <div className="flex gap-1.5">
          {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[0.72rem] font-menu font-semibold ${filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {FILTER_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-alert text-[0.82rem] mb-3">{error}</p>}

      {loading ? (
        <p className="text-gray-400 text-[0.85rem]">Carregando...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-[0.85rem] text-center py-8">Nenhum comentário nessa categoria.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
                <th className="p-2.5">Comentário</th><th className="p-2.5">Notícia</th><th className="p-2.5">Status</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 align-top">
                  <td className="p-2.5 max-w-[260px]">
                    <span className="font-semibold">{c.authorName}</span>
                    <p className="text-gray-600">&quot;{c.text}&quot;</p>
                  </td>
                  <td className="p-2.5">
                    <Link href={`/noticia/${c.news.slug}`} className="text-primary hover:underline" target="_blank">{c.news.title}</Link>
                  </td>
                  <td className="p-2.5">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold w-fit ${c.approved ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {c.approved ? "Aprovado" : "Pendente"}
                      </span>
                      {c.flagged && (
                        <span className="px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold w-fit bg-red-100 text-alert">
                          🚩 Sinalizado{c.reportCount > 0 ? ` (${c.reportCount} denúncia${c.reportCount > 1 ? "s" : ""})` : " (filtro automático)"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    {!c.approved && (
                      <button onClick={() => approve(c)} disabled={busyId === c.id} className="mr-2" aria-label="Aprovar">✔️</button>
                    )}
                    {c.approved && (
                      <button onClick={() => reject(c)} disabled={busyId === c.id} className="mr-2" aria-label="Reprovar">⛔</button>
                    )}
                    <button onClick={() => remove(c)} disabled={busyId === c.id} aria-label="Excluir">🗑️</button>
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
