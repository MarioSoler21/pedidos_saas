import { createAdminClient } from "@/lib/supabase/admin";
import { getProductos, type Producto } from "@/lib/data/catalogo";
import { toBranding, type TenantBranding } from "@/lib/branding";

/**
 * Portal de cliente SIN login: se resuelve todo por clientes.token_unico.
 * El token es opaco y unico por tenant. Usamos el cliente admin (service_role,
 * bypassa RLS) porque no hay JWT de usuario en este flujo — ver
 * README-arquitectura.md. NADA que venga del navegador se usa como tenant_id
 * o cliente_id: se derivan siempre del token en el servidor.
 */

export type PortalCliente = {
  id: number;
  nombre_negocio: string;
  tenant_id: number;
  tenant_nombre: string;
  branding: TenantBranding;
};

const TENANT_BRANDING_COLS =
  "nombre_empresa, nombre_app, subtitulo_app, mensaje_portal, logo_url, color_primario, color_secundario, color_sidebar";

export async function getClientePorToken(
  token: string,
): Promise<PortalCliente | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clientes")
    .select(
      `id, nombre_negocio, tenant_id, activo, tenants ( ${TENANT_BRANDING_COLS} )`,
    )
    .eq("token_unico", token)
    .maybeSingle();

  if (error) throw error;
  if (!data || !data.activo) return null;

  const tenant = data.tenants as unknown as
    | Record<string, string | null>
    | null;

  return {
    id: data.id as number,
    nombre_negocio: data.nombre_negocio as string,
    tenant_id: data.tenant_id as number,
    tenant_nombre: tenant?.nombre_empresa ?? "",
    branding: toBranding(tenant),
  };
}

export type PortalData = {
  cliente: PortalCliente;
  productos: Producto[];
};

export async function getPortalData(token: string): Promise<PortalData | null> {
  const cliente = await getClientePorToken(token);
  if (!cliente) return null;

  const productos = await getProductos(String(cliente.tenant_id));
  return { cliente, productos };
}
