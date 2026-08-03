"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/api";

function RedefinirSenhaForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-[420px] mx-auto bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
        <p className="text-alert text-[0.9rem]">Link inválido. Peça um novo link de redefinição de senha.</p>
        <Link href="/esqueci-senha" className="block w-full text-center bg-primary text-white font-menu font-semibold text-[0.85rem] py-2.5 rounded-full hover:bg-primary-dark mt-5">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto bg-white rounded-2xl shadow-xl p-8 mb-6">
      <h1 className="font-title font-bold text-[1.15rem] mb-4">Criar nova senha</h1>

      {done ? (
        <p className="text-[0.85rem] text-gray-600">Senha redefinida com sucesso! Levando você para o login...</p>
      ) : (
        <>
          {error && <p className="text-alert text-[0.8rem] mb-3.5 text-center">{error}</p>}
          <form onSubmit={submit}>
            <div className="mb-3.5">
              <label className="text-[0.75rem] font-semibold block mb-1.5">Nova senha</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.88rem]"
              />
            </div>
            <div className="mb-4">
              <label className="text-[0.75rem] font-semibold block mb-1.5">Confirmar nova senha</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.88rem]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-primary text-white font-menu font-semibold text-[0.85rem] py-2.5 rounded-full hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Redefinir senha"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <main className="-mt-0 bg-gradient-to-br from-support via-[#1c1c1c] to-[#7a3a10] min-h-[calc(100vh-64px)] px-4">
      <div className="text-center py-6">
        <Link href="/" className="font-title font-extrabold text-2xl text-white">
          PORTAL <span className="text-primary">TUCUMÃ</span> MILGRAU
        </Link>
        <div className="font-menu text-[0.7rem] uppercase tracking-widest text-gray-400 mt-1">A notícia em tempo real</div>
      </div>

      <Suspense fallback={null}>
        <RedefinirSenhaForm />
      </Suspense>

      <Link href="/login" className="block text-center text-gray-400 text-[0.8rem] pb-8 hover:text-primary">
        ← Voltar para o login
      </Link>
    </main>
  );
}
