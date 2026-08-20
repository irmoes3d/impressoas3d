"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Logo } from "@/components/brand/Logo";

export function AuthForms() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const result = mode === "login" ? await signIn(email, password) : await signUp(name, email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === "signup") {
      setInfo("Conta criada! Se a confirmação por e-mail estiver ativa no seu projeto Supabase, verifique sua caixa de entrada antes de entrar.");
      setMode("login");
      return;
    }
    const role = "role" in result ? result.role : undefined;
    router.replace(role === "admin" || role === "funcionario" ? "/admin" : "/conta");
    router.refresh();
  }

  return (
    <div className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
      <div className="hidden justify-center lg:flex">
        <div className="flex items-center justify-center rounded-[2rem] bg-graphite-900 p-10">
          <Logo href={null} size={220} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex rounded-full bg-graphite-100 p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${mode === "login" ? "bg-white shadow-sm text-ink" : "text-graphite-500"}`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${mode === "signup" ? "bg-white shadow-sm text-ink" : "text-graphite-500"}`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input required placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
          )}
          <input required type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
          <input required type="password" minLength={6} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />

          {error && <p className="text-sm text-danger">{error}</p>}
          {info && <p className="text-sm text-ok">{info}</p>}

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
            {mode === "login" ? "Entrar" : "Criar minha conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
