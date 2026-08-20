"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface PingState {
  ok: boolean;
  error?: string;
  pingedAt?: string;
}

/** Faz uma leitura leve no banco para contar como atividade e evitar a pausa
 * automática de projetos Supabase gratuitos por inatividade. Usado pelo botão
 * manual do painel; o disparo automático a cada 3 dias fica em vercel.json,
 * que chama app/api/keep-alive/route.ts. */
export async function pingSupabaseNow(): Promise<PingState> {
  const supabase = await createSupabaseServerClient();
  const { data: session } = await supabase.auth.getUser();
  if (!session.user) {
    return { ok: false, error: "Sessão expirada. Faça login novamente." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "funcionario")) {
    return { ok: false, error: "Apenas administradores ou funcionários podem disparar o ping." };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("profiles").select("id").limit(1);
    if (error && error.code !== "42P01") throw error;
    return { ok: true, pingedAt: new Date().toISOString() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao pingar o Supabase." };
  }
}
