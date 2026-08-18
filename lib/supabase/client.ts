"use client";

import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para uso em componentes client. Usa apenas a chave anon
// (segura para o navegador) — nunca importe lib/supabase/admin.ts aqui.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
