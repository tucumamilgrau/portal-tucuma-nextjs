"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o e-mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="-mt-0 bg-gradient-to-br from-support via-[#1c1c1c] to-[#7a3a10] min-h-[calc(100vh-64px)] px-4">
      <div className="text-center py-6">
        <Link href="/" className="font-title font-extrabold text-2xl text-white">
          PORTAL <span className="text-primary">TUCUMÃ</span> MILGRAU
        </Link>
        <div className="font-menu text-[0.7rem] uppercase tracking-widest text-gray-400 mt-1">A notícia em tempo real</div>
      </div>

      <div className="max-w-[420px] mx-auto bg-white rounded-2xl shadow-xl p-8 mb-6">
        <h1 className="font-title font-bold text-[1.15rem] mb-1.5">Esqueci minha senha</h1>

        {sent ? (
          <>
            <p className="text-[0.85rem] text-gray-600 mt-3">
              Se <b>{email}</b> estiver cadastrado, enviamos um link de redefinição de senha para esse e-mail.
              Confira também a caixa de spam.
            </p>
            <Link
              href="/login"
              className="block w-full text-center bg-primary text-white font-menu font-semibold text-[0.85rem] py-2.5 rounded-full hover:bg-primary-dark mt-5"
            >
              Voltar para o login
            </Link>
          </>
        ) : (
          <>
            <p className="text-[0.85rem] text-gray-600 mb-4">
              Digite o e-mail da sua conta que enviaremos um link para você criar uma nova senha.
            </p>

            {error && <p className="text-alert text-[0.8rem] mb-3.5 text-center">{error}</p>}

            <form onSubmit={submit}>
              <div className="mb-4">
                <label className="text-[0.75rem] font-semibold block mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.88rem]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full justify-center bg-primary text-white font-menu font-semibold text-[0.85rem] py-2.5 rounded-full hover:bg-primary-dark disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>
          </>
        )}
      </div>

      <Link href="/login" className="block text-center text-gray-400 text-[0.8rem] pb-8 hover:text-primary">
        ← Voltar para o login
      </Link>
    </main>
  );
}
