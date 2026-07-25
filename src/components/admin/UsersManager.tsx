"use client";

import { useEffect, useState } from "react";
import { adminListUsers, adminUpdateUserRole, adminDeleteUser, type AuthUser } from "@/lib/api";
import { getToken, getStoredUser } from "@/lib/auth-client";

export default function UsersManager() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const token = getToken();
  const me = getStoredUser();

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setUsers(await adminListUsers(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRole = async (u: AuthUser) => {
    if (!token) return;
    const nextRole = u.role === "ADMIN" ? "READER" : "ADMIN";
    if (!confirm(`Alterar o papel de ${u.name} para ${nextRole === "ADMIN" ? "Administrador" : "Leitor"}?`)) return;
    setBusyId(u.id);
    try {
      await adminUpdateUserRole(token, u.id, nextRole);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível atualizar o usuário.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (u: AuthUser) => {
    if (!token) return;
    if (!confirm(`Excluir a conta de ${u.name} (${u.email})? Essa ação não pode ser desfeita.`)) return;
    setBusyId(u.id);
    try {
      await adminDeleteUser(token, u.id);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-5 max-w-full">
      <h3 className="text-[1rem] font-title font-semibold mb-4">Usuários</h3>

      {error && <p className="text-alert text-[0.82rem] mb-3">{error}</p>}

      {loading ? (
        <p className="text-gray-400 text-[0.85rem]">Carregando...</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[0.82rem]">
            <thead>
              <tr className="text-left text-gray-600 font-menu text-[0.72rem] uppercase border-b-2 border-gray-200">
                <th className="p-2.5">Nome</th><th className="p-2.5">E-mail</th><th className="p-2.5">Papel</th><th className="p-2.5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === me?.id;
                return (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="p-2.5">{u.name} {isSelf && <span className="text-gray-400 text-[0.72rem]">(você)</span>}</td>
                    <td className="p-2.5 text-gray-500">{u.email}</td>
                    <td className="p-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${u.role === "ADMIN" ? "bg-primary/15 text-primary" : "bg-gray-100 text-gray-600"}`}>
                        {u.role === "ADMIN" ? "Administrador" : "Leitor"}
                      </span>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      {isSelf ? (
                        <span className="text-gray-400 text-[0.75rem]">gerenciado por outro admin</span>
                      ) : (
                        <>
                          <button onClick={() => toggleRole(u)} disabled={busyId === u.id} className="mr-2 text-[0.75rem] font-menu font-semibold text-primary">
                            {u.role === "ADMIN" ? "Tornar Leitor" : "Tornar Admin"}
                          </button>
                          <button onClick={() => remove(u)} disabled={busyId === u.id} aria-label={`Excluir ${u.name}`}>
                            {busyId === u.id ? "⏳" : "🗑️"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
