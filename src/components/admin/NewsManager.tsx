"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  adminListNews,
  adminCreateNews,
  adminUpdateNews,
  adminDeleteNews,
  adminUploadCover,
  adminRemoveCover,
  getCategories,
  getAuthors,
  resolveMediaUrl,
  type ApiNews,
  type ApiCategory,
  type ApiAuthor,
  type NewsFormInput,
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

const EMPTY_FORM: NewsFormInput = {
  title: "",
  subtitle: "",
  excerpt: "",
  body: "",
  coverIcon: "📰",
  readTimeMin: 4,
  status: "PUBLISHED",
  featured: false,
  categorySlug: "",
  authorSlug: "",
  videoUrl: "",
};

export default function NewsManager() {
  const [news, setNews] = useState<ApiNews[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [authors, setAuthors] = useState<ApiAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsFormInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Foto de capa: separada do resto do form porque o upload é uma chamada própria (multipart).
  const [currentCoverImage, setCurrentCoverImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [removingCover, setRemovingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = getToken();

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    // Chamadas independentes: uma falhar (ex.: token expirando) não deve impedir
    // categorias/autores de carregar, já que são endpoints públicos separados.
    const [newsResult, catsResult, autsResult] = await Promise.allSettled([
      adminListNews(token),
      getCategories(),
      getAuthors(),
    ]);
    if (newsResult.status === "fulfilled") setNews(newsResult.value);
    if (catsResult.status === "fulfilled") setCategories(catsResult.value);
    if (autsResult.status === "fulfilled") setAuthors(autsResult.value);

    const failed = newsResult.status === "rejected" ? newsResult.reason : null;
    if (failed) setLoadError(failed instanceof Error ? failed.message : "Não foi possível carregar as notícias.");
    setLoading(false);
  };

  useEffect(() => {
    // Busca inicial dos dados na API ao montar — caso de uso canônico do useEffect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Libera a object URL do preview local ao trocar de arquivo/desmontar, evitando vazamento de memória.
  useEffect(() => {
    return () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    };
  }, [selectedPreview]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return news;
    return news.filter((n) => n.title.toLowerCase().includes(q) || n.category.name.toLowerCase().includes(q));
  }, [news, search]);

  const resetCoverState = () => {
    setCurrentCoverImage(null);
    setSelectedFile(null);
    setSelectedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, categorySlug: categories[0]?.slug ?? "", authorSlug: authors[0]?.slug ?? "" });
    setFormError(null);
    resetCoverState();
    setFormOpen(true);
  };

  const openEdit = (n: ApiNews) => {
    setEditingId(n.id);
    setForm({
      title: n.title,
      subtitle: n.subtitle,
      excerpt: n.excerpt,
      body: n.body,
      coverIcon: n.coverIcon,
      readTimeMin: n.readTimeMin,
      status: n.status as NewsFormInput["status"],
      featured: n.featured,
      categorySlug: n.category.slug,
      authorSlug: n.author.slug,
      videoUrl: n.videoUrl ?? "",
    });
    setFormError(null);
    resetCoverState();
    setCurrentCoverImage(n.coverImage);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    setSelectedFile(file);
    setSelectedPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleRemoveCoverNow = async () => {
    if (!token || !editingId) return;
    setRemovingCover(true);
    try {
      await adminRemoveCover(token, editingId);
      setCurrentCoverImage(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível remover a foto.");
    } finally {
      setRemovingCover(false);
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError(null);
    try {
      const saved = editingId ? await adminUpdateNews(token, editingId, form) : await adminCreateNews(token, form);
      if (selectedFile) {
        await adminUploadCover(token, saved.id, selectedFile);
      }
      setFormOpen(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (n: ApiNews) => {
    if (!token) return;
    if (!confirm(`Excluir a notícia "${n.title}"? Essa ação não pode ser desfeita.`)) return;
    setDeletingId(n.id);
    try {
      await adminDeleteNews(token, n.id);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setDeletingId(null);
    }
  };

  const coverPreviewUrl = selectedPreview ?? resolveMediaUrl(currentCoverImage);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-5 max-w-full">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-[1rem] font-title font-semibold">Gestão de Notícias</h3>
        <div className="flex gap-2.5 items-center flex-wrap">
          <input
            type="text"
            placeholder="Buscar notícia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-[0.8rem]"
          />
          <button
            onClick={openCreate}
            className="bg-primary text-white font-menu font-semibold text-[0.75rem] px-3 py-2 rounded-full whitespace-nowrap"
          >
            ＋ Nova Notícia
          </button>
        </div>
      </div>

      {loadError && <p className="text-alert text-[0.82rem] mb-3">{loadError}</p>}

      {loading ? (
        <p className="text-gray-400 text-[0.85rem]">Carregando...</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
                <th className="p-2.5">Foto</th><th className="p-2.5">Título</th><th className="p-2.5">Categoria</th><th className="p-2.5">Autor</th><th className="p-2.5">Status</th><th className="p-2.5">Data</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => {
                const thumb = resolveMediaUrl(n.coverImage);
                return (
                  <tr key={n.id} className="border-b border-gray-100">
                    <td className="p-2.5">
                      {thumb ? (
                        // Miniatura de upload do admin: URL dinâmica/local, next/image exigiria allowlist por host arbitrário.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <span className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-base">{n.coverIcon}</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {n.featured && <span title="Em destaque na home" className="mr-1">⭐</span>}
                      {n.title}
                      {n.sourceUrl && (
                        <span
                          title={`Importado de ${n.sourceName ?? "fonte externa"} — revise antes de publicar`}
                          className="ml-2 inline-block px-1.5 py-0.5 rounded-full text-[0.62rem] font-bold bg-blue-100 text-highlight align-middle"
                        >
                          🔗 {n.sourceName ?? "importado"}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">{n.category.name}</td>
                    <td className="p-2.5">{n.author.name}</td>
                    <td className="p-2.5"><span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${STATUS_STYLE[n.status]}`}>{STATUS_LABEL[n.status]}</span></td>
                    <td className="p-2.5 whitespace-nowrap">{new Date(n.publishedAt).toLocaleDateString("pt-BR")}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <button onClick={() => openEdit(n)} className="mr-2" aria-label={`Editar ${n.title}`}>✏️</button>
                      <button onClick={() => handleDelete(n)} disabled={deletingId === n.id} aria-label={`Excluir ${n.title}`}>
                        {deletingId === n.id ? "⏳" : "🗑️"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-gray-400">Nenhuma notícia encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-title font-semibold text-[1.05rem]">{editingId ? "Editar Notícia" : "Nova Notícia"}</h4>
              <button onClick={closeForm} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>

            {formError && <p className="text-alert text-[0.82rem] mb-3">{formError}</p>}

            <form onSubmit={submitForm} className="space-y-3.5">
              <FormField label="Título">
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                />
              </FormField>

              <FormField label="Subtítulo (opcional)">
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                />
              </FormField>

              <FormField label="Resumo (aparece nos cards)">
                <textarea
                  required
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem] min-h-[60px]"
                />
              </FormField>

              <FormField label="Corpo da matéria">
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Separe parágrafos com uma linha em branco."
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem] min-h-[140px]"
                />
              </FormField>

              <FormField label="Foto de capa">
                <div className="flex items-center gap-3.5">
                  <div className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {coverPreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverPreviewUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{form.coverIcon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onFileChange} className="text-[0.8rem]" />
                    <div className="flex gap-3 mt-1.5 text-[0.72rem]">
                      {selectedFile && <span className="text-gray-500">Será enviada ao salvar.</span>}
                      {!selectedFile && currentCoverImage && (
                        <button type="button" onClick={handleRemoveCoverNow} disabled={removingCover} className="text-alert font-semibold">
                          {removingCover ? "Removendo..." : "Remover foto atual"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </FormField>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <FormField label="Ícone (emoji, sem foto)">
                  <input
                    value={form.coverIcon}
                    onChange={(e) => setForm((f) => ({ ...f, coverIcon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                  />
                </FormField>
                <FormField label="Min. de leitura">
                  <input
                    type="number"
                    min={1}
                    value={form.readTimeMin}
                    onChange={(e) => setForm((f) => ({ ...f, readTimeMin: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                  />
                </FormField>
                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as NewsFormInput["status"] }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                  >
                    <option value="PUBLISHED">Publicado</option>
                    <option value="DRAFT">Rascunho</option>
                    <option value="SCHEDULED">Agendado</option>
                  </select>
                </FormField>
              </div>

              <label className="flex items-center gap-2 text-[0.82rem]">
                <input
                  type="checkbox"
                  checked={form.featured ?? false}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                />
                ⭐ Destaque (aparece no slider &quot;Notícias em Destaque&quot; da home)
              </label>

              <FormField label="Vídeo (opcional, aparece abaixo do texto da notícia)">
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... ou outro link de vídeo"
                  value={form.videoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField label="Categoria">
                  <select
                    required
                    value={form.categorySlug}
                    onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                  >
                    <option value="" disabled>Selecione...</option>
                    {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Autor">
                  <select
                    required
                    value={form.authorSlug}
                    onChange={(e) => setForm((f) => ({ ...f, authorSlug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]"
                  >
                    <option value="" disabled>Selecione...</option>
                    {authors.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
                  </select>
                </FormField>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-full border border-gray-200 font-menu font-semibold text-[0.8rem]">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-full bg-primary text-white font-menu font-semibold text-[0.8rem] disabled:opacity-60">
                  {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[0.75rem] font-semibold block mb-1">{label}</label>
      {children}
    </div>
  );
}
