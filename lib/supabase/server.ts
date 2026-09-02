import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components / API routes / Server Actions.
 * Lee y escribe el JWT via cookies (auth.jwt() -> app_metadata.tenant_id
 * llega a Postgres/RLS a partir de esta sesion).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll puede fallar si se llama desde un Server Component sin
            // response mutable (Next.js lo maneja via el middleware que
            // refresca la sesion). Se puede ignorar en ese contexto.
          }
        },
      },
    },
  );
}
