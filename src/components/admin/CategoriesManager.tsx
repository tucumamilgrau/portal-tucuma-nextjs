"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  type ApiCategory,
  type CategoryFormInput,
} from "@/lib/api";
import { getToken } from "@/lib/auth-client";

const COLOR_OPTIONS = [
  { value: "primary", label: "Laranja (primária)" },
  { value: "alert", label: "Vermelho (alerta)" },
  { value: "highlight", label: "Azul (destaque)" },
  { value: "green", label: "Verde" },
] as const;

const EMPTY_FORM: CategoryFormInput = { slug: "", name: "", color: "primary" };

const COLOR_SWATCH: Record<string, string> = {
  primary: "bg-primary",
  alert: "bg-alert",
  highlight: "bg-highlight",
  green: "bg-green-600",
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = getToken();

  const reload = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setCategories(await getCategories());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Não foi possível carregar as categorias.");
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
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (c: ApiCategory) => {
    setEditingId(c.id);
    setForm({ slug: c.slug, name: c.name, color: c.color as CategoryFormInput["color"] });
    setFormError(null);
    setFormOpen(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) await adminUpdateCategory(token, editingId, form);
      else await adminCreateCategory(token, form);
      setFormOpen(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: ApiCategory) => {
    if (!token) return;
    if (!confirm(`Excluir a categoria "${c.name}"?`)) return;
    setDeletingId(c.id);
    try {
      await adminDeleteCategory(token, c.id);
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
        <h3 className="text-[1rem] font-title font-semibold">Categorias</h3>
        <div className="flex gap-2.5 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-[0.8rem]"
          />
          <button onClick={openCreate} className="bg-primary text-white font-menu font-semibold text-[0.75rem] px-3 py-2 rounded-full whitespace-nowrap">
            ＋ Nova Categoria
          </button>
        </div>
      </div>

      {loadError && <p className="text-alert text-[0.82rem] mb-3">{loadError}</p>}

      {loading ? (
        <p className="text-gray-400 text-[0.85rem]">Carregando...</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
                <th className="p-2.5">Nome</th><th className="p-2.5">Slug</th><th className="p-2.5">Cor</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="p-2.5">{c.name}</td>
                  <td className="p-2.5 text-gray-500">{c.slug}</td>
                  <td className="p-2.5">
                    <span className={`inline-block w-4 h-4 rounded-full align-middle ${COLOR_SWATCH[c.color] ?? "bg-gray-300"}`} />
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="mr-2" aria-label={`Editar ${c.name}`}>✏️</button>
                    <button onClick={() => handleDelete(c)} disabled={deletingId === c.id} aria-label={`Excluir ${c.name}`}>
                      {deletingId === c.id ? "⏳" : "🗑️"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">Nenhuma categoria encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-title font-semibold text-[1.05rem]">{editingId ? "Editar Categoria" : "Nova Categoria"}</h4>
              <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>

            {formError && <p className="text-alert text-[0.82rem] mb-3">{formError}</p>}

            <form onSubmit={submitForm} className="space-y-3.5">
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Nome</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Slug (usado na URL /categoria/slug)</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                  pattern="[a-z0-9-]+"
                  title="apenas letras minúsculas, números e hífen"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Cor</label>
                <select value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value as CategoryFormInput["color"] }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]">
                  {COLOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
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
