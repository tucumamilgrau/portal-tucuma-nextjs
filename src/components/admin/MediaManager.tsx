"use client";

import { useEffect, useRef, useState } from "react";
import { adminListMedia, adminUploadMedia, adminDeleteMedia, resolveMediaUrl, type ApiMediaItem } from "@/lib/api";
import { getToken } from "@/lib/auth-client";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaManager() {
  const [items, setItems] = useState<ApiMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = getToken();

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      setItems(await adminListMedia(token));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Não foi possível carregar a mídia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    setUploadError(null);
    try {
      await adminUploadMedia(token, file);
      await reload();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Não foi possível enviar o arquivo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (item: ApiMediaItem) => {
    if (!token) return;
    if (!confirm(`Excluir "${item.filename}"? Se estiver em uso em alguma notícia, a imagem vai quebrar.`)) return;
    setDeletingFile(item.filename);
    try {
      await adminDeleteMedia(token, item.filename);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setDeletingFile(null);
    }
  };

  const copyUrl = async (item: ApiMediaItem) => {
    const url = resolveMediaUrl(item.url) ?? item.url;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFile(item.filename);
      setTimeout(() => setCopiedFile(null), 1500);
    } catch {
      // clipboard indisponível (ex: contexto não seguro) — sem tratamento especial, é só conveniência.
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-5 max-w-full">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-[1rem] font-title font-semibold">Biblioteca de Mídia</h3>
        <div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onFileChange} disabled={uploading} className="text-[0.8rem]" />
          {uploading && <span className="text-[0.75rem] text-gray-400 ml-2">Enviando...</span>}
        </div>
      </div>

      {uploadError && <p className="text-alert text-[0.82rem] mb-3">{uploadError}</p>}
      {loadError && <p className="text-alert text-[0.82rem] mb-3">{loadError}</p>}

      {loading ? (
        <p className="text-gray-400 text-[0.85rem]">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-[0.85rem] text-center py-8">Nenhum arquivo enviado ainda. Use o campo acima para enviar imagens.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.filename} className="border border-gray-100 rounded-lg overflow-hidden">
              {/* URL dinâmica de upload — next/image exigiria allowlist por host arbitrário */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveMediaUrl(item.url)} alt={item.filename} className="w-full aspect-square object-cover bg-gray-100" />
              <div className="p-2">
                <div className="text-[0.68rem] text-gray-400">{formatBytes(item.size)}</div>
                <div className="flex gap-1.5 mt-1.5">
                  <button onClick={() => copyUrl(item)} className="flex-1 text-[0.68rem] font-menu font-semibold border border-gray-200 rounded px-1.5 py-1 hover:bg-gray-50">
                    {copiedFile === item.filename ? "Copiado!" : "Copiar URL"}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingFile === item.filename}
                    className="text-[0.68rem] font-menu font-semibold border border-gray-200 rounded px-1.5 py-1 text-alert hover:bg-red-50"
                  >
                    {deletingFile === item.filename ? "⏳" : "🗑️"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
