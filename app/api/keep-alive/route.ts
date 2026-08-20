import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Endpoint chamado pelo cron do Vercel (vercel.json, a cada 3 dias) para
// manter o projeto Supabase gratuito fora do estado de pausa por inatividade.
// Se CRON_SECRET estiver definido nas variáveis de ambiente, o Vercel Cron
// já envia o header Authorization automaticamente — configure a mesma chave
// lá para proteger a rota de chamadas externas.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
    }
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error && error.code !== "42P01") throw error;
    return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Falha ao pingar o Supabase." },
      { status: 500 }
    );
  }
}
