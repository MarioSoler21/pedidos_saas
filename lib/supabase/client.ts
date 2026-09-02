import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para uso en componentes de cliente ("use client").
 * Usa la publishable key: segura de exponer al navegador (RLS protege los datos).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
