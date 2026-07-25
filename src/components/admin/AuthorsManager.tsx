"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAuthors,
  adminCreateAuthor,
  adminUpdateAuthor,
  adminDeleteAuthor,
  type ApiAuthor,
  type AuthorFormInput,
} from "@/lib/api";
import { getToken } from "@/lib/auth-client";

const EMPTY_FORM: AuthorFormInput = { slug: "", name: "", initials: "", specialty: "", bio: "" };

export default function AuthorsManager() {
  const [authors, setAuthors] = useState<ApiAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AuthorFormInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = getToken();

  const reload = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setAuthors(await getAuthors());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Não foi possível carregar os autores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter((a) => a.name.toLowerCase().includes(q) || a.specialty.toLowerCase().includes(q));
  }, [authors, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (a: ApiAuthor) => {
    setEditingId(a.id);
    setForm({ slug: a.slug, name: a.name, initials: a.initials, specialty: a.specialty, bio: a.bio });
    setFormError(null);
    setFormOpen(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) await adminUpdateAuthor(token, editingId, form);
      else await adminCreateAuthor(token, form);
      setFormOpen(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: ApiAuthor) => {
    if (!token) return;
    if (!confirm(`Excluir o autor "${a.name}"?`)) return;
    setDeletingId(a.id);
    try {
      await adminDeleteAuthor(token, a.id);
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
        <h3 className="text-[1rem] font-title font-semibold">Autores</h3>
        <div className="flex gap-2.5 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-[0.8rem]"
          />
          <button onClick={openCreate} className="bg-primary text-white font-menu font-semibold text-[0.75rem] px-3 py-2 rounded-full whitespace-nowrap">
            ＋ Novo Autor
          </button>
        </div>
      </div>

      {loadError && <p className="text-alert text-[0.82rem] mb-3">{loadError}</p>}

      {loading ? (
        <p className="text-gray-400 text-[0.85rem]">Carregando...</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
                <th className="p-2.5">Autor</th><th className="p-2.5">Especialidade</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-gray-100">
                  <td className="p-2.5 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-support text-white flex items-center justify-center font-title font-bold text-[0.7rem]">{a.initials}</span>
                    {a.name}
                  </td>
                  <td className="p-2.5 text-gray-500">{a.specialty}</td>
                  <td className="p-2.5 whitespace-nowrap">
                    <button onClick={() => openEdit(a)} className="mr-2" aria-label={`Editar ${a.name}`}>✏️</button>
                    <button onClick={() => handleDelete(a)} disabled={deletingId === a.id} aria-label={`Excluir ${a.name}`}>
                      {deletingId === a.id ? "⏳" : "🗑️"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="p-4 text-center text-gray-400">Nenhum autor encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-title font-semibold text-[1.05rem]">{editingId ? "Editar Autor" : "Novo Autor"}</h4>
              <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>

            {formError && <p className="text-alert text-[0.82rem] mb-3">{formError}</p>}

            <form onSubmit={submitForm} className="space-y-3.5">
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Nome</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Slug</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                  pattern="[a-z0-9-]+"
                  title="apenas letras minúsculas, números e hífen"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Iniciais</label>
                  <input required maxLength={4} value={form.initials} onChange={(e) => setForm((f) => ({ ...f, initials: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Especialidade</label>
                  <input required value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
                </div>
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Bio (opcional)</label>
                <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem] min-h-[70px]" />
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
