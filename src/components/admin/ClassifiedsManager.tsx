"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminListClassifieds,
  adminCreateClassified,
  adminUpdateClassified,
  adminDeleteClassified,
  resolveMediaUrl,
  type ApiClassified,
  type ClassifiedFormInput,
} from "@/lib/api";
import { getToken } from "@/lib/auth-client";

const CATEGORIES: ClassifiedFormInput["category"][] = ["Imóveis", "Veículos", "Empregos", "Serviços"];

const EMPTY_FORM: ClassifiedFormInput = {
  title: "",
  category: "Imóveis",
  price: "",
  description: "",
  icon: "📦",
  imageUrl: "",
  active: true,
};

export default function ClassifiedsManager() {
  const [items, setItems] = useState<ApiClassified[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassifiedFormInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = getToken();

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      setItems(await adminListClassifieds(token));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Não foi possível carregar os classificados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [items, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (c: ApiClassified) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      category: c.category,
      price: c.price,
      description: c.description,
      icon: c.icon,
      imageUrl: c.imageUrl ?? "",
      active: c.active,
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
      const payload = { ...form, imageUrl: form.imageUrl || undefined };
      if (editingId) await adminUpdateClassified(token, editingId, payload);
      else await adminCreateClassified(token, payload);
      setFormOpen(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: ApiClassified) => {
    if (!token) return;
    try {
      await adminUpdateClassified(token, c.id, { active: !c.active });
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  };

  const handleDelete = async (c: ApiClassified) => {
    if (!token) return;
    if (!confirm(`Excluir o classificado "${c.title}"?`)) return;
    setDeletingId(c.id);
    try {
      await adminDeleteClassified(token, c.id);
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
        <h3 className="text-[1rem] font-title font-semibold">Classificados</h3>
        <div className="flex gap-2.5 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar classificado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-[0.8rem]"
          />
          <button onClick={openCreate} className="bg-primary text-white font-menu font-semibold text-[0.75rem] px-3 py-2 rounded-full whitespace-nowrap">
            ＋ Novo Classificado
          </button>
        </div>
      </div>

      {loadError && <p className="text-alert text-[0.82rem] mb-3">{loadError}</p>}

      {loading ? (
        <p className="text-gray-400 text-[0.85rem]">Carregando...</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
                <th className="p-2.5">Foto</th><th className="p-2.5">Título</th><th className="p-2.5">Categoria</th><th className="p-2.5">Preço</th><th className="p-2.5">Status</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const thumb = resolveMediaUrl(c.imageUrl);
                return (
                  <tr key={c.id} className="border-b border-gray-100">
                    <td className="p-2.5">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <span className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-base">{c.icon}</span>
                      )}
                    </td>
                    <td className="p-2.5">{c.title}</td>
                    <td className="p-2.5 text-gray-500">{c.category}</td>
                    <td className="p-2.5">{c.price}</td>
                    <td className="p-2.5">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${c.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        {c.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <button onClick={() => openEdit(c)} className="mr-2" aria-label={`Editar ${c.title}`}>✏️</button>
                      <button onClick={() => handleDelete(c)} disabled={deletingId === c.id} aria-label={`Excluir ${c.title}`}>
                        {deletingId === c.id ? "⏳" : "🗑️"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">Nenhum classificado encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-title font-semibold text-[1.05rem]">{editingId ? "Editar Classificado" : "Novo Classificado"}</h4>
              <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>

            {formError && <p className="text-alert text-[0.82rem] mb-3">{formError}</p>}

            <form onSubmit={submitForm} className="space-y-3.5">
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Título</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ClassifiedFormInput["category"] }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Preço</label>
                  <input required placeholder="R$ 280.000" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
                </div>
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Descrição (opcional)</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem] min-h-[70px]" />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Ícone (emoji, sem foto)</label>
                  <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">URL da foto (opcional)</label>
                  <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="/uploads/media/arquivo.webp" className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
                </div>
              </div>
              <p className="text-[0.7rem] text-gray-400">Dica: envie a foto em <a href="/admin/midia" className="text-primary hover:underline">Mídia</a> e copie a URL aqui.</p>
              <label className="flex items-center gap-2 text-[0.82rem]">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                Ativo (visível no portal)
              </label>

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
