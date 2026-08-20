"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { pingSupabaseNow, type PingState } from "@/lib/actions/keepalive";

const LAST_PING_KEY = "2irmaos:supabase-last-ping";
const initialState: PingState = { ok: false };

export function SupabaseKeepAlive() {
  const [state, formAction, pending] = useActionState(async (_prev: PingState) => pingSupabaseNow(), initialState);
  const [lastPing, setLastPing] = useState<string | null>(null);

  useEffect(() => {
    setLastPing(localStorage.getItem(LAST_PING_KEY));
  }, []);

  useEffect(() => {
    if (state.ok && state.pingedAt) {
      localStorage.setItem(LAST_PING_KEY, state.pingedAt);
      setLastPing(state.pingedAt);
    }
  }, [state]);

  return (
    <div className="space-y-4 rounded-2xl border border-graphite-100 bg-white p-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Manter Supabase ativo</h2>
        <p className="mt-1 text-xs text-graphite-400">
          Projetos gratuitos do Supabase pausam após dias sem atividade. Um disparo automático roda a
          cada 3 dias (configurado em <code>vercel.json</code>), ou dispare manualmente quando quiser.
        </p>
      </div>

      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60"
        >
          <RefreshCw size={15} className={pending ? "animate-spin" : ""} /> {pending ? "Disparando..." : "Disparar agora"}
        </button>
      </form>

      {state.error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-danger">
          <XCircle size={13} /> {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-ok">
          <CheckCircle2 size={13} /> Ping enviado com sucesso.
        </p>
      )}
      {lastPing && (
        <p className="text-[11px] text-graphite-400">
          Último ping: {new Date(lastPing).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
}
