"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminListVideos,
  adminCreateVideo,
  adminUpdateVideo,
  adminDeleteVideo,
  resolveMediaUrl,
  formatViews,
  type ApiVideo,
  type VideoFormInput,
} from "@/lib/api";
import { getToken } from "@/lib/auth-client";

const EMPTY_FORM: VideoFormInput = {
  title: "",
  videoUrl: "",
  thumbnailUrl: "",
  icon: "🎥",
  duration: "",
  views: 0,
  live: false,
  active: true,
};

export default function VideosManager() {
  const [items, setItems] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoFormInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = getToken();

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      setItems(await adminListVideos(token));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Não foi possível carregar os vídeos.");
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
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [items, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (v: ApiVideo) => {
    setEditingId(v.id);
    setForm({
      title: v.title,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl ?? "",
      icon: v.icon,
      duration: v.duration ?? "",
      views: v.views,
      live: v.live,
      active: v.active,
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
      const payload = {
        ...form,
        thumbnailUrl: form.thumbnailUrl || undefined,
        duration: form.live ? undefined : form.duration || undefined,
      };
      if (editingId) await adminUpdateVideo(token, editingId, payload);
      else await adminCreateVideo(token, payload);
      setFormOpen(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (v: ApiVideo) => {
    if (!token) return;
    try {
      await adminUpdateVideo(token, v.id, { active: !v.active });
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  };

  const handleDelete = async (v: ApiVideo) => {
    if (!token) return;
    if (!confirm(`Excluir o vídeo "${v.title}"?`)) return;
    setDeletingId(v.id);
    try {
      await adminDeleteVideo(token, v.id);
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
        <h3 className="text-[1rem] font-title font-semibold">Últimos Vídeos</h3>
        <div className="flex gap-2.5 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar vídeo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-[0.8rem]"
          />
          <button onClick={openCreate} className="bg-primary text-white font-menu font-semibold text-[0.75rem] px-3 py-2 rounded-full whitespace-nowrap">
            ＋ Novo Vídeo
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
                <th className="p-2.5">Miniatura</th><th className="p-2.5">Título</th><th className="p-2.5">Duração</th><th className="p-2.5">Visualizações</th><th className="p-2.5">Status</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const thumb = resolveMediaUrl(v.thumbnailUrl);
                return (
                  <tr key={v.id} className="border-b border-gray-100">
                    <td className="p-2.5">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <span className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-base">{v.icon}</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{v.title}</a>
                    </td>
                    <td className="p-2.5 text-gray-500">{v.live ? "🔴 AO VIVO" : v.duration || "—"}</td>
                    <td className="p-2.5 text-gray-500">{formatViews(v.views)}</td>
                    <td className="p-2.5">
                      <button
                        onClick={() => toggleActive(v)}
                        className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${v.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        {v.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <button onClick={() => openEdit(v)} className="mr-2" aria-label={`Editar ${v.title}`}>✏️</button>
                      <button onClick={() => handleDelete(v)} disabled={deletingId === v.id} aria-label={`Excluir ${v.title}`}>
                        {deletingId === v.id ? "⏳" : "🗑️"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">Nenhum vídeo encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-title font-semibold text-[1.05rem]">{editingId ? "Editar Vídeo" : "Novo Vídeo"}</h4>
              <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>

            {formError && <p className="text-alert text-[0.82rem] mb-3">{formError}</p>}

            <form onSubmit={submitForm} className="space-y-3.5">
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Título</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">URL do vídeo (YouTube, Instagram...)</label>
                <input required type="url" placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Ícone (emoji, sem miniatura)</label>
                  <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">URL da miniatura (opcional)</label>
                  <input value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))} placeholder="/uploads/media/arquivo.webp" className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
                </div>
              </div>
              <p className="text-[0.7rem] text-gray-400">Dica: envie a miniatura em <a href="/admin/midia" className="text-primary hover:underline">Mídia</a> e copie a URL aqui.</p>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Duração</label>
                  <input
                    disabled={form.live}
                    placeholder="08:32"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem] disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Visualizações</label>
                  <input
                    type="number"
                    min={0}
                    value={form.views}
                    onChange={(e) => setForm((f) => ({ ...f, views: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[0.82rem]">
                <input type="checkbox" checked={form.live} onChange={(e) => setForm((f) => ({ ...f, live: e.target.checked }))} />
                🔴 Ao vivo agora (substitui a duração)
              </label>
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
