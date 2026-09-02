import { createAdminClient } from "@/lib/supabase/admin";
import { toBranding, type TenantBranding } from "@/lib/branding";

/**
 * Lecturas para el panel /admin. Server-only, scoped explícitamente por
 * tenant_id (viene de la cookie dev, ver lib/dev-session.ts). A diferencia de
 * lib/data/catalogo.ts, acá se traen TODAS las filas (activas e inactivas) y
 * todas las columnas editables.
 */

export type UsuarioRow = {
  id: number;
  nombre: string;
  rol: string;
  telefono: string | null;
  pin: string | null;
  activo: boolean;
  auth_user_id: string | null;
  created_at: string;
};

export type ClienteRow = {
  id: number;
  nombre_negocio: string;
  nombre_contacto: string | null;
  telefono: string | null;
  direccion: string | null;
  zona_id: number | null;
  tipo_cliente: string | null;
  notas: string | null;
  token_unico: string;
  activo: boolean;
};

export type ProductoRow = {
  id: number;
  sku: string;
  nombre: string;
  categoria_id: number | null;
  unidad_medida: string;
  precio: number;
  costo: number;
  stock_actual: number;
  stock_minimo: number;
  activo: boolean;
};

export type ZonaRow = {
  id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activa: boolean;
};

export type CategoriaRow = { id: number; nombre: string };

export type TenantRow = {
  id: number;
  nombre_empresa: string;
  slug: string;
  plan: string;
  activo: boolean;
  nombre_app: string | null;
  subtitulo_app: string | null;
  mensaje_portal: string | null;
  logo_url: string | null;
  color_primario: string | null;
  color_secundario: string | null;
  color_sidebar: string | null;
};

const TENANT_COLS =
  "id, nombre_empresa, slug, plan, activo, nombre_app, subtitulo_app, mensaje_portal, logo_url, color_primario, color_secundario, color_sidebar";

export async function listUsuarios(tenantId: string): Promise<UsuarioRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre, rol, telefono, pin, activo, auth_user_id, created_at")
    .eq("tenant_id", tenantId)
    .order("activo", { ascending: false })
    .order("nombre");
  if (error) throw error;
  return data as UsuarioRow[];
}

export async function listClientes(tenantId: string): Promise<ClienteRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clientes")
    .select(
      "id, nombre_negocio, nombre_contacto, telefono, direccion, zona_id, tipo_cliente, notas, token_unico, activo",
    )
    .eq("tenant_id", tenantId)
    .order("activo", { ascending: false })
    .order("nombre_negocio");
  if (error) throw error;
  return data as ClienteRow[];
}

export async function listProductos(tenantId: string): Promise<ProductoRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("productos")
    .select(
      "id, sku, nombre, categoria_id, unidad_medida, precio, costo, stock_actual, stock_minimo, activo",
    )
    .eq("tenant_id", tenantId)
    .order("activo", { ascending: false })
    .order("nombre");
  if (error) throw error;
  return data as ProductoRow[];
}

export async function listZonas(tenantId: string): Promise<ZonaRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("zonas")
    .select("id, nombre, descripcion, orden, activa")
    .eq("tenant_id", tenantId)
    .order("orden")
    .order("nombre");
  if (error) throw error;
  return data as ZonaRow[];
}

export async function listCategorias(tenantId: string): Promise<CategoriaRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categorias_producto")
    .select("id, nombre")
    .eq("tenant_id", tenantId)
    .order("nombre");
  if (error) throw error;
  return data as CategoriaRow[];
}

export async function getTenant(tenantId: string): Promise<TenantRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .select(TENANT_COLS)
    .eq("id", tenantId)
    .maybeSingle();
  if (error) throw error;
  return (data as TenantRow) ?? null;
}

/** Branding resuelto (con defaults aplicados) para el shell del dashboard. */
export async function getTenantBranding(
  tenantId: string,
): Promise<TenantBranding> {
  const row = await getTenant(tenantId);
  return toBranding(row);
}

/** Contadores para el hub de /admin. */
export async function getAdminCounts(tenantId: string) {
  const supabase = createAdminClient();
  const tablas = [
    "usuarios",
    "clientes",
    "productos",
    "zonas",
    "categorias_producto",
  ] as const;
  const entries = await Promise.all(
    tablas.map(async (t) => {
      const { count, error } = await supabase
        .from(t)
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId);
      if (error) throw error;
      return [t, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<
    (typeof tablas)[number],
    number
  >;
}
