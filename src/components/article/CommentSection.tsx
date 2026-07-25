"use client";

import { useState } from "react";
import { postComment, reportComment, type ApiComment } from "@/lib/api";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export default function CommentSection({ slug, initialComments }: { slug: string; initialComments: ApiComment[] }) {
  const [comments, setComments] = useState<ApiComment[]>(initialComments);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const handleReport = async (id: string) => {
    if (reportedIds.has(id)) return;
    if (!confirm("Denunciar este comentário para revisão da moderação?")) return;
    try {
      await reportComment(id);
      setReportedIds((prev) => new Set(prev).add(id));
    } catch {
      alert("Não foi possível enviar a denúncia agora.");
    }
  };

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const created = await postComment(slug, "Você", text);
      setComments((prev) => [created, ...prev]);
      setText("");
    } catch {
      setError("Não foi possível publicar o comentário. A API está rodando?");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3 mb-5 border-b-[3px] border-support pb-2.5">
        <h2 className="text-[1.4rem] font-title font-semibold flex items-center gap-2.5">
          <span className="w-2 h-6 bg-primary rounded-sm inline-block" />
          Comentários ({comments.length})
        </h2>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-support text-white flex items-center justify-center font-title font-bold shrink-0">EU</div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Deixe seu comentário..."
            className="w-full min-h-[70px] p-3 border border-gray-200 rounded-md text-[0.85rem] resize-y"
          />
          {error && <p className="text-alert text-[0.75rem] mt-1">{error}</p>}
          <button
            onClick={submit}
            disabled={sending}
            className="mt-2 bg-primary text-white font-menu font-semibold text-[0.75rem] px-3 py-1.5 rounded-full hover:bg-primary-dark disabled:opacity-60"
          >
            {sending ? "Publicando..." : "Publicar comentário"}
          </button>
        </div>
      </div>

      {comments.map((c) => (
        <div key={c.id} className="flex gap-3 py-4 border-b border-gray-100">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-support text-white flex items-center justify-center font-title font-bold shrink-0">{initials(c.authorName)}</div>
          <div className="flex-1">
            <b className="text-[0.9rem]">{c.authorName}</b> <span className="text-gray-400 text-[0.72rem]">· {timeAgo(c.createdAt)}</span>
            <p className="mt-1 text-[0.85rem]">{c.text}</p>
            <div className="flex gap-3.5 mt-1.5 font-menu text-[0.72rem] text-gray-400">
              <span>👍 Curtir {c.likes > 0 ? `(${c.likes})` : ""}</span>
              <span>Responder</span>
              <button onClick={() => handleReport(c.id)} disabled={reportedIds.has(c.id)} className="hover:text-alert disabled:text-alert disabled:cursor-default">
                {reportedIds.has(c.id) ? "Denunciado" : "Denunciar"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
