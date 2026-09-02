import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Lecturas server-only, explicitamente filtradas por tenant_id (viene de la
 * cookie dev, ver lib/dev-session.ts). Usa el cliente admin (service_role,
 * bypassa RLS) porque todavia no hay JWT real con app_metadata.tenant_id —
 * ver TODO en lib/dev-session.ts.
 */

export type Cliente = {
  id: number;
  nombre_negocio: string;
  nombre_contacto: string | null;
  telefono: string | null;
  zona_id: number | null;
};

export async function getClientes(tenantId: string): Promise<Cliente[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nombre_negocio, nombre_contacto, telefono, zona_id")
    .eq("tenant_id", tenantId)
    .eq("activo", true)
    .order("nombre_negocio");

  if (error) throw error;
  return data;
}

export type Producto = {
  id: number;
  sku: string;
  nombre: string;
  precio: number;
  stock_actual: number;
};

export async function getProductos(tenantId: string): Promise<Producto[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("productos")
    .select("id, sku, nombre, precio, stock_actual")
    .eq("tenant_id", tenantId)
    .eq("activo", true)
    .order("nombre");

  if (error) throw error;
  return data;
}
