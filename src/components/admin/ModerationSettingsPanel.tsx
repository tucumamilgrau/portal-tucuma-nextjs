"use client";

import { useEffect, useState } from "react";
import {
  adminGetModerationSettings,
  adminUpdateModerationSettings,
  adminGetModerationStats,
  type ApiModerationStats,
} from "@/lib/api";
import { getToken } from "@/lib/auth-client";

export default function ModerationSettingsPanel() {
  const [stats, setStats] = useState<ApiModerationStats | null>(null);
  const [keywords, setKeywords] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [s, st] = await Promise.all([adminGetModerationSettings(token), adminGetModerationStats(token)]);
        setKeywords(s.keywords);
        setEnabled(s.enabled);
        setStats(st);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar as configurações.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await adminUpdateModerationSettings(token, { enabled, keywords });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-[0.85rem]">Carregando...</p>;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm p-5 max-w-full">
        <h3 className="text-[1rem] font-title font-semibold mb-2">Filtro Heurístico de Comentários</h3>
        <p className="text-[0.8rem] text-gray-500 mb-4">
          Não é um modelo de IA/LLM externo — é um filtro baseado em regras que roda localmente: compara o texto de
          cada comentário novo contra a lista de termos abaixo e alguns padrões comuns de spam (texto todo em
          maiúsculas, caractere repetido em excesso). Comentários sinalizados entram como pendentes em vez de
          aparecerem direto no ar — revise em <a href="/admin/comentarios" className="text-primary hover:underline">Comentários</a>.
        </p>

        {error && <p className="text-alert text-[0.82rem] mb-3">{error}</p>}

        <label className="flex items-center gap-2 text-[0.85rem] mb-3.5">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Filtro ativo
        </label>

        <label className="text-[0.75rem] font-semibold block mb-1">Termos suspeitos (separados por vírgula)</label>
        <textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem] min-h-[90px]"
        />

        <div className="flex items-center gap-3 mt-3.5">
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-full bg-primary text-white font-menu font-semibold text-[0.8rem] disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar configuração"}
          </button>
          {saved && <span className="text-green-600 text-[0.8rem]">Salvo!</span>}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-[18px]">
            <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Comentários analisados</div>
            <div className="font-title text-[1.7rem] font-bold my-1.5">{stats.totalAnalyzed}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-[18px]">
            <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Sinalizados pelo filtro/denúncias</div>
            <div className="font-title text-[1.7rem] font-bold my-1.5">{stats.totalFlagged}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-[18px]">
            <div className="text-[0.72rem] text-gray-400 font-menu uppercase">Pendentes de revisão</div>
            <div className="font-title text-[1.7rem] font-bold my-1.5">{stats.pendingReview}</div>
          </div>
        </div>
      )}
    </div>
  );
}
