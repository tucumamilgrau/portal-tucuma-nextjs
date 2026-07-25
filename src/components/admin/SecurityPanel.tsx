"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";
import { getToken, getStoredUser } from "@/lib/auth-client";

export default function SecurityPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const token = getToken();
  const me = getStoredUser();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("A confirmação não confere com a nova senha.");
      return;
    }
    setSaving(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível trocar a senha.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 max-w-lg">
      <h3 className="text-[1rem] font-title font-semibold mb-2">Trocar senha</h3>
      <p className="text-[0.8rem] text-gray-500 mb-4">
        Conta: <b>{me?.email}</b>. Recomendado especialmente para a conta administradora padrão semeada no primeiro
        setup (senha de desenvolvimento, não deve continuar em produção).
      </p>

      {error && <p className="text-alert text-[0.82rem] mb-3">{error}</p>}
      {success && <p className="text-green-600 text-[0.82rem] mb-3">Senha alterada com sucesso.</p>}

      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="text-[0.75rem] font-semibold block mb-1">Senha atual</label>
          <input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
        </div>
        <div>
          <label className="text-[0.75rem] font-semibold block mb-1">Nova senha (mín. 6 caracteres)</label>
          <input required minLength={6} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
        </div>
        <div>
          <label className="text-[0.75rem] font-semibold block mb-1">Confirmar nova senha</label>
          <input required minLength={6} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-[0.85rem]" />
        </div>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-full bg-primary text-white font-menu font-semibold text-[0.8rem] disabled:opacity-60">
          {saving ? "Salvando..." : "Trocar senha"}
        </button>
      </form>
    </div>
  );
}
