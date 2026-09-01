"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setReady(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === "PASSWORD_RECOVERY" || session)) setReady(true);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [supabase]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Use pelo menos 12 caracteres, incluindo maiúscula, minúscula, número e símbolo.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("O link expirou ou a senha não pôde ser alterada. Solicite uma nova recuperação.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-14">
      <section className="w-full max-w-md rounded-2xl border border-graphite-100 bg-white p-6 shadow-sm">
        <KeyRound className="mb-4 text-accent" size={28} />
        <h1 className="font-display text-2xl font-bold text-ink">Criar nova senha</h1>
        <p className="mt-2 text-sm text-graphite-500">Escolha uma senha exclusiva para proteger pedidos, clientes e pagamentos.</p>
        {!ready ? (
          <p className="mt-6 rounded-xl bg-sun-100 p-3 text-sm text-sun">Abra esta página pelo link recebido no e-mail de recuperação. Se o link acabou de abrir, aguarde alguns segundos.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input required type="password" minLength={12} autoComplete="new-password" placeholder="Nova senha" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
            <input required type="password" minLength={12} autoComplete="new-password" placeholder="Confirmar nova senha" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60">
              {loading && <Loader2 size={16} className="animate-spin" />} Salvar nova senha
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
