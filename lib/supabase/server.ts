import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Cliente Supabase para Server Components / Server Actions, ligado à sessão
// do usuário via cookies. Ainda usa somente a chave anon — respeita RLS.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado a partir de um Server Component sem contexto de resposta;
            // o middleware cuida de manter a sessão atualizada nesse caso.
          }
        },
      },
    }
  );
}
