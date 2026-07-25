"use client";

import { useEffect, useMemo, useState } from "react";
import { adminListAds, adminCreateAd, adminUpdateAd, adminDeleteAd, type ApiAd, type AdFormInput } from "@/lib/api";
import { getToken } from "@/lib/auth-client";

const SLOT_LABEL: Record<string, string> = {
  sidebar: "Barra lateral (home)",
  "article-sidebar": "Barra lateral (artigo)",
  "footer-banner": "Banner do rodapé",
};

const EMPTY_FORM: AdFormInput = { slot: "sidebar", title: "", imageUrl: "", linkUrl: "", active: true, startsAt: "", endsAt: "" };

export default function AdsManager() {
  const [ads, setAds] = useState<ApiAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdFormInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = getToken();

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      setAds(await adminListAds(token));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Não foi possível carregar os anúncios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => [...ads].sort((a, b) => Number(b.active) - Number(a.active)), [ads]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (ad: ApiAd) => {
    setEditingId(ad.id);
    setForm({
      slot: ad.slot as AdFormInput["slot"],
      title: ad.title,
      imageUrl: ad.imageUrl ?? "",
      linkUrl: ad.linkUrl,
      active: ad.active,
      startsAt: ad.startsAt ? ad.startsAt.slice(0, 10) : "",
      endsAt: ad.endsAt ? ad.endsAt.slice(0, 10) : "",
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
      const payload: AdFormInput = {
        ...form,
        imageUrl: form.imageUrl || undefined,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
      };
      if (editingId) await adminUpdateAd(token, editingId, payload);
      else await adminCreateAd(token, payload);
      setFormOpen(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: ApiAd) => {
    if (!token) return;
    try {
      await adminUpdateAd(token, ad.id, { active: !ad.active });
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  };

  const handleDelete = async (ad: ApiAd) => {
    if (!token) return;
    if (!confirm(`Excluir o anúncio "${ad.title}"?`)) return;
    setDeletingId(ad.id);
    try {
      await adminDeleteAd(token, ad.id);
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
        <h3 className="text-[1rem] font-title font-semibold">Publicidade</h3>
        <button onClick={openCreate} className="bg-primary text-white font-menu font-semibold text-[0.75rem] px-3 py-2 rounded-full whitespace-nowrap">
          ＋ Novo Anúncio
        </button>
      </div>

      {loadError && <p className="text-alert text-[0.82rem] mb-3">{loadError}</p>}

      {loading ? (
        <p className="text-gray-400 text-[0.85rem]">Carregando...</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-400 text-[0.85rem] text-center py-8">
          Nenhum anúncio cadastrado — os espaços do site mostram o placeholder decorativo padrão.
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
                <th className="p-2.5">Título</th><th className="p-2.5">Espaço</th><th className="p-2.5">Período</th><th className="p-2.5">Status</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-100">
                  <td className="p-2.5">{ad.title}</td>
                  <td className="p-2.5 text-gray-500">{SLOT_LABEL[ad.slot] ?? ad.slot}</td>
                  <td className="p-2.5 text-gray-500 whitespace-nowrap text-[0.75rem]">
                    {ad.startsAt ? new Date(ad.startsAt).toLocaleDateString("pt-BR") : "—"} até {ad.endsAt ? new Date(ad.endsAt).toLocaleDateString("pt-BR") : "sem prazo"}
                  </td>
                  <td className="p-2.5">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${ad.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                    >
                      {ad.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    <button onClick={() => openEdit(ad)} className="mr-2" aria-label={`Editar ${ad.title}`}>✏️</button>
                    <button onClick={() => handleDelete(ad)} disabled={deletingId === ad.id} aria-label={`Excluir ${ad.title}`}>
                      {deletingId === ad.id ? "⏳" : "🗑️"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-title font-semibold text-[1.05rem]">{editingId ? "Editar Anúncio" : "Novo Anúncio"}</h4>
              <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>

            {formError && <p className="text-alert text-[0.82rem] mb-3">{formError}</p>}

            <form onSubmit={submitForm} className="space-y-3.5">
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Espaço</label>
                <select value={form.slot} onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value as AdFormInput["slot"] }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]">
                  {Object.entries(SLOT_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Título</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">URL da imagem (opcional — use a Biblioteca de Mídia)</label>
                <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="/uploads/media/arquivo.webp" className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Link de destino</label>
                <input required type="url" value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Início (opcional)</label>
                  <input type="date" value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
                </div>
                <div>
                  <label className="text-[0.75rem] font-semibold block mb-1">Fim (opcional)</label>
                  <input type="date" value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[0.82rem]">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                Ativo
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
