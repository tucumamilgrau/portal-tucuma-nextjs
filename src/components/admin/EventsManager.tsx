"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminListEvents,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  type ApiEvent,
  type EventFormInput,
} from "@/lib/api";
import { getToken } from "@/lib/auth-client";

const EMPTY_FORM: EventFormInput = {
  title: "",
  location: "",
  eventDate: "",
  active: true,
};

function toDatetimeLocal(iso: string): string {
  // datetime-local espera "YYYY-MM-DDTHH:mm" no horário local, sem timezone.
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatEventDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function EventsManager() {
  const [items, setItems] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = getToken();

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      setItems(await adminListEvents(token));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Não foi possível carregar os eventos.");
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
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
  }, [items, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (ev: ApiEvent) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      location: ev.location,
      eventDate: toDatetimeLocal(ev.eventDate),
      active: ev.active,
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
      const payload = { ...form, eventDate: new Date(form.eventDate).toISOString() };
      if (editingId) await adminUpdateEvent(token, editingId, payload);
      else await adminCreateEvent(token, payload);
      setFormOpen(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ev: ApiEvent) => {
    if (!token) return;
    try {
      await adminUpdateEvent(token, ev.id, { active: !ev.active });
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  };

  const handleDelete = async (ev: ApiEvent) => {
    if (!token) return;
    if (!confirm(`Excluir o evento "${ev.title}"?`)) return;
    setDeletingId(ev.id);
    try {
      await adminDeleteEvent(token, ev.id);
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
        <h3 className="text-[1rem] font-title font-semibold">Agenda de Eventos</h3>
        <div className="flex gap-2.5 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-[0.8rem]"
          />
          <button onClick={openCreate} className="bg-primary text-white font-menu font-semibold text-[0.75rem] px-3 py-2 rounded-full whitespace-nowrap">
            ＋ Novo Evento
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
                <th className="p-2.5">Título</th><th className="p-2.5">Data e hora</th><th className="p-2.5">Local</th><th className="p-2.5">Status</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id} className="border-b border-gray-100">
                  <td className="p-2.5">{ev.title}</td>
                  <td className="p-2.5 text-gray-500 whitespace-nowrap">{formatEventDateTime(ev.eventDate)}</td>
                  <td className="p-2.5 text-gray-500">{ev.location}</td>
                  <td className="p-2.5">
                    <button
                      onClick={() => toggleActive(ev)}
                      className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${ev.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                    >
                      {ev.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    <button onClick={() => openEdit(ev)} className="mr-2" aria-label={`Editar ${ev.title}`}>✏️</button>
                    <button onClick={() => handleDelete(ev)} disabled={deletingId === ev.id} aria-label={`Excluir ${ev.title}`}>
                      {deletingId === ev.id ? "⏳" : "🗑️"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-400">Nenhum evento encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-title font-semibold text-[1.05rem]">{editingId ? "Editar Evento" : "Novo Evento"}</h4>
              <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>

            {formError && <p className="text-alert text-[0.82rem] mb-3">{formError}</p>}

            <form onSubmit={submitForm} className="space-y-3.5">
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Título</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Data e hora</label>
                <input
                  required
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                />
              </div>
              <div>
                <label className="text-[0.75rem] font-semibold block mb-1">Local</label>
                <input required placeholder="Praça Central" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
              </div>
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
