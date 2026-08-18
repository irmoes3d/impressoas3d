"use client";

import { useEffect, useState } from "react";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Logo } from "@/components/brand/Logo";

const DEMO_KEY = "2irmaos:admin-demo";

export function useIsStaff() {
  const { profile, loading } = useAuth();
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    setDemo(localStorage.getItem(DEMO_KEY) === "1");
  }, []);

  const isStaff = demo || profile?.role === "admin" || profile?.role === "funcionario";
  return { isStaff, loading, demo };
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth();
  const { isStaff, demo } = useIsStaff();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  if (loading || !ready) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-graphite-300" /></div>;
  }

  if (isStaff) return <>{children}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
  }

  function enterDemo() {
    localStorage.setItem(DEMO_KEY, "1");
    window.location.reload();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-graphite-900 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <Logo href={null} className="mx-auto mb-6 flex justify-center" size={128} />
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wide text-graphite-400">
          Painel administrativo
        </p>

        {user && !isStaff && (
          <p className="mb-4 rounded-xl bg-sun-100 px-3 py-2 text-xs text-sun">
            Sua conta ({user.email}) ainda não tem permissão de administrador/funcionário. Peça para um
            admin alterar seu perfil na tabela <code>profiles</code>, ou entre em modo demonstração abaixo.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input required type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
          <input required type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Entrar
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-graphite-300">
          <span className="h-px flex-1 bg-graphite-100" /> ou <span className="h-px flex-1 bg-graphite-100" />
        </div>

        <button onClick={enterDemo} className="flex w-full items-center justify-center gap-2 rounded-full border border-accent px-4 py-3 text-sm font-semibold text-accent hover:bg-accent-100">
          <ShieldCheck size={16} /> Entrar em modo demonstração
        </button>
        <p className="mt-3 text-center text-[11px] text-graphite-400">
          O modo demonstração libera o painel sem exigir um usuário admin real no Supabase — use para
          explorar a interface. {demo && "(ativo neste navegador)"}
        </p>
      </div>
    </div>
  );
}
