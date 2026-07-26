"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminListColumns,
  adminCreateColumn,
  adminUpdateColumn,
  adminDeleteColumn,
  getAuthors,
  type ApiColumn,
  type ApiAuthor,
  type ColumnFormInput,
} from "@/lib/api";
import { getToken } from "@/lib/auth-client";

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-600",
  DRAFT: "bg-gray-100 text-gray-600",
  SCHEDULED: "bg-blue-100 text-highlight",
};
const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Publicado",
  DRAFT: "Rascunho",
  SCHEDULED: "Agendado",
};

const EMPTY_FORM: ColumnFormInput = {
  title: "",
  excerpt: "",
  status: "PUBLISHED",
  authorSlug: "",
};

export default function ColumnsManager() {
  const [items, setItems] = useState<ApiColumn[]>([]);
  const [authors, setAuthors] = useState<ApiAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ColumnFormInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = getToken();

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    const [colsResult, autsResult] = await Promise.allSettled([adminListColumns(token), getAuthors()]);
    if (colsResult.status === "fulfilled") setItems(colsResult.value);
    if (autsResult.status === "fulfilled") setAuthors(autsResult.value);
    if (colsResult.status === "rejected") {
      setLoadError(colsResult.reason instanceof Error ? colsResult.reason.message : "Não foi possível carregar as colunas.");
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.author.name.toLowerCase().includes(q));
  }, [items, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, authorSlug: authors[0]?.slug ?? "" });
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (c: ApiColumn) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      excerpt: c.excerpt,
      status: c.status,
      authorSlug: c.author.slug,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) await adminUpdateColumn(token, editingId, form);
      else await adminCreateColumn(token, form);
      setFormOpen(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: ApiColumn) => {
    if (!token) return;
    if (!confirm(`Excluir a coluna "${c.title}"?`)) return;
    setDeletingId(c.id);
    try {
      await adminDeleteColumn(token, c.id);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-5 max-w-full">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-[1rem] font-title font-semibold">Colunistas & Opinião</h3>
        <div className="flex gap-2.5 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar coluna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-[0.8rem]"
          />
          <button onClick={openCreate} className="bg-primary text-white font-menu font-semibold text-[0.75rem] px-3 py-2 rounded-full whitespace-nowrap">
            ＋ Nova Coluna
          </button>
        </div>
      </div>

      {loadError && <p className="text-alert text-[0.82rem] mb-3">{loadError}</p>}
      {authors.length === 0 && !loading && (
        <p className="text-[0.78rem] text-gray-500 mb-3">
          Nenhum autor cadastrado ainda — crie um em <a href="/admin/autores" className="text-primary hover:underline">Autores</a> antes de publicar uma coluna.
        </p>
      )}

      {loading ? (
        <p className="text-gray-400 text-[0.85rem]">Carregando...</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
                <th className="p-2.5">Título</th><th className="p-2.5">Colunista</th><th className="p-2.5">Status</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="p-2.5">{c.title}</td>
                  <td className="p-2.5 text-gray-500">{c.author.name}</td>
                  <td className="p-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${STATUS_STYLE[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="mr-2" aria-label={`Editar ${c.title}`}>✏️</button>
                    <button onClick={() => handleDelete(c)} disabled={deletingId === c.id} aria-label={`Excluir ${c.title}`}>
                      {deletingId === c.id ? "⏳" : "🗑️"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">Nenhuma coluna encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-title font-semibold text-[1.05rem]">{editingId ? "Editar Coluna" : "Nova Coluna"}</h4>
              <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>

            {formError && <p className="text-alert text-[0.82rem] mb-3">{formError}</p>}

            <form onSubmit={submitForm} className="space-y-3.5">
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Título / frase de opinião</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" placeholder="O futuro da PA-279 e o desenvolvimento do sul do Pará" />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Resumo (opcional)</label>
                <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem] min-h-[70px]" />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Colunista</label>
                  <select
                    required
                    value={form.authorSlug}
                    onChange={(e) => setForm((f) => ({ ...f, authorSlug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                  >
                    <option value="" disabled>Selecione...</option>
                    {authors.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ColumnFormInput["status"] }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                  >
                    <option value="DRAFT">Rascunho</option>
                    <option value="SCHEDULED">Agendado</option>
                    <option value="PUBLISHED">Publicado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-full border border-gray-200 font-menu font-semibold text-[0.8rem]">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-full bg-primary text-white font-menu font-semibold text-[0.8rem] disabled:opacity-60">
                  {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
