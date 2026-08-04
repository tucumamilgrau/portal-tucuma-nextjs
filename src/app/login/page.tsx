"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser, registerUser } from "@/lib/api";
import { saveSession } from "@/lib/auth-client";

const CIDADES = ["Tucumã", "Ourilândia", "São Félix", "Xinguara", "Redenção", "Canaã", "Marabá"];

function LoginForm() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const expired = params.get("expired") === "1";

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", city: CIDADES[0] });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await loginUser(loginForm);
      saveSession(auth);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await registerUser(signupForm);
      saveSession(auth);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
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
        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          <button
            onClick={() => { setTab("login"); setError(null); }}
            className={`flex-1 py-2.5 rounded-full font-menu font-bold text-[0.8rem] ${tab === "login" ? "bg-support text-white" : ""}`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setTab("signup"); setError(null); }}
            className={`flex-1 py-2.5 rounded-full font-menu font-bold text-[0.8rem] ${tab === "signup" ? "bg-support text-white" : ""}`}
          >
            Cadastrar
          </button>
        </div>

        {expired && !error && (
          <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-md text-[0.78rem] mb-3.5 text-center py-2 px-3">
            Sua sessão expirou por inatividade. Faça login novamente.
          </p>
        )}
        {error && <p className="text-alert text-[0.8rem] mb-3.5 text-center">{error}</p>}

        {tab === "login" ? (
          <form onSubmit={submitLogin}>
            <Field
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Field
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
            />
            <div className="flex justify-between items-center text-[0.78rem] mb-4">
              <label className="flex items-center gap-1.5"><input type="checkbox" />Lembrar-me</label>
              <Link href="/esqueci-senha" className="text-primary font-semibold">Esqueci a senha</Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-primary text-white font-menu font-semibold text-[0.85rem] py-2.5 rounded-full hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <div className="flex flex-col gap-2.5 mt-4">
              <SocialButton icon="🔴" label="Continuar com Google" />
              <SocialButton icon="🔵" label="Continuar com Facebook" />
            </div>
          </form>
        ) : (
          <form onSubmit={submitSignup}>
            <Field
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              value={signupForm.name}
              onChange={(e) => setSignupForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Field
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={signupForm.email}
              onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Field
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              value={signupForm.password}
              onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
            />
            <div className="mb-3.5">
              <label className="text-[0.75rem] font-semibold block mb-1.5">Cidade</label>
              <select
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.88rem]"
                value={signupForm.city}
                onChange={(e) => setSignupForm((f) => ({ ...f, city: e.target.value }))}
              >
                {CIDADES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-1.5 text-[0.76rem] mb-4">
              <input type="checkbox" />Quero receber notificações e newsletter
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-primary text-white font-menu font-semibold text-[0.85rem] py-2.5 rounded-full hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>
        )}

        <div className="mt-5 pt-[18px] border-t border-gray-100 text-center">
          <span className="bg-gradient-to-br from-[#FBBF24] to-primary text-support font-bold text-[0.65rem] font-menu px-2.5 py-1 rounded-full inline-block">⭐ Portal Premium</span>
          <p className="text-[0.78rem] text-gray-600 mt-2">Assine e tenha acesso a reportagens exclusivas, sem anúncios e downloads.</p>
        </div>
      </div>

      <Link href="/" className="block text-center text-gray-400 text-[0.8rem] pb-8 hover:text-primary">
        ← Voltar para o portal
      </Link>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-3.5">
      <label className="text-[0.75rem] font-semibold block mb-1.5">{label}</label>
      <input {...props} className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-[0.88rem]" required />
    </div>
  );
}

function SocialButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-md font-semibold text-[0.82rem]">
      {icon} {label}
    </button>
  );
}
