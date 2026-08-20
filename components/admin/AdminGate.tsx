"use client";

import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Logo } from "@/components/brand/Logo";

export function useIsStaff() {
  const { profile, loading } = useAuth();
  const isStaff = profile?.role === "admin" || profile?.role === "funcionario";
  return { isStaff, loading };
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth();
  const { isStaff } = useIsStaff();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-graphite-300" /></div>;
  }

  if (isStaff) return <>{children}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    setBusy(false);
    if (result.error) setError(result.error);
    else if (result.role !== "admin" && result.role !== "funcionario") setError("Esta conta não possui acesso administrativo.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-graphite-900 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <Logo href={null} className="mx-auto mb-6 flex justify-center" size={128} />
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wide text-graphite-400">Painel administrativo</p>
        {user && !isStaff && <p className="mb-4 rounded-xl bg-sun-100 px-3 py-2 text-xs text-sun">A conta {user.email} não possui permissão administrativa.</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
          <input required type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Entrar no painel
          </button>
        </form>
      </div>
    </div>
  );
}
