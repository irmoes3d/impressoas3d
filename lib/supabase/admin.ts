import "server-only";
import { createClient } from "@supabase/supabase-js";

// ATENÇÃO: este cliente usa a service_role key e ignora TODAS as políticas
// de RLS. Nunca importe este arquivo em um componente/hook client ("use client"),
// nunca serialize seu resultado bruto para o browser sem filtrar campos, e
// nunca exponha SUPABASE_SERVICE_ROLE_KEY como NEXT_PUBLIC_*.
//
// Uso permitido: Server Actions e Route Handlers do painel administrativo,
// depois de validar (via lib/supabase/server.ts) que o usuário autenticado
// tem profile.role em ("admin", "funcionario"); e o script scripts/seed.ts.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
