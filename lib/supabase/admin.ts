import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role: bypassa RLS. SOLO usar en codigo de servidor
 * (API routes / Server Actions), nunca importar desde un componente cliente.
 *
 * Casos de uso: setear app_metadata.tenant_id de un usuario nuevo (signup
 * flow), resolver /pedido/[token] para el portal de cliente sin login,
 * validar PIN de operador_bodega.
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY en el entorno (no NEXT_PUBLIC_, nunca
 * exponer al navegador). Agregala a .env.local desde el dashboard de
 * Supabase: Project Settings -> API -> service_role key.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno. No la expongas con prefijo NEXT_PUBLIC_.",
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
