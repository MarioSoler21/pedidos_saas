import { cache } from "react";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Sesion real de la app: usuario autenticado con Supabase Auth (correo +
 * contraseña, ver app/login/) + su(s) fila(s) en public.usuarios + el
 * tenant activo. Un mismo auth.users puede tener una fila usuarios por
 * tenant (README-arquitectura.md §2) — cuando eso pasa, el usuario puede
 * cambiar de negocio activo (ver `negocios` + setActiveTenant) sin volver a
 * loguearse.
 *
 * Se resuelve con el cliente admin (service_role) porque las paginas de
 * app/(dashboard) todavia leen/escriben filtrando explicitamente por
 * tenant_id en vez de confiar en RLS (ver TODOs en lib/data/*.ts).
 */
export type Session = {
  id: string; // tenant_id activo — string para calzar con la firma de lib/data/*.ts
  slug: string;
  nombreEmpresa: string;
  usuarioId: number;
  usuarioNombre: string;
  rol: string;
  email: string;
  negocios: { tenantId: string; nombreEmpresa: string; rol: string }[];
};

const ACTIVE_TENANT_COOKIE = "active_tenant_id";

export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  const { data: usuarios, error: usuariosError } = await admin
    .from("usuarios")
    .select("id, nombre, rol, tenant_id")
    .eq("auth_user_id", user.id)
    .eq("activo", true);
  if (usuariosError) throw usuariosError;
  if (!usuarios || usuarios.length === 0) return null;

  const tenantIds = usuarios.map((u) => u.tenant_id);
  const { data: tenants, error: tenantsError } = await admin
    .from("tenants")
    .select("id, slug, nombre_empresa")
    .in("id", tenantIds)
    .eq("activo", true);
  if (tenantsError) throw tenantsError;

  const membresias = usuarios
    .map((u) => {
      const tenant = tenants?.find((t) => t.id === u.tenant_id);
      if (!tenant) return null;
      return {
        tenantId: String(tenant.id),
        slug: tenant.slug,
        nombreEmpresa: tenant.nombre_empresa,
        usuarioId: u.id,
        usuarioNombre: u.nombre,
        rol: u.rol,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);
  if (membresias.length === 0) return null;

  const cookieStore = await cookies();
  const activeTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value;
  const activa =
    membresias.find((m) => m.tenantId === activeTenantId) ?? membresias[0];

  return {
    id: activa.tenantId,
    slug: activa.slug,
    nombreEmpresa: activa.nombreEmpresa,
    usuarioId: activa.usuarioId,
    usuarioNombre: activa.usuarioNombre,
    rol: activa.rol,
    email: user.email ?? "",
    negocios: membresias.map((m) => ({
      tenantId: m.tenantId,
      nombreEmpresa: m.nombreEmpresa,
      rol: m.rol,
    })),
  };
});

/**
 * Fija el tenant activo (cookie server-only). Solo se puede llamar desde una
 * Server Action / Route Handler (no desde un Server Component). No hace
 * falta validar que el tenantId pertenezca al usuario acá: getSession()
 * ignora cualquier valor que no matchee una fila usuarios real del usuario
 * autenticado (fail-safe por diseño).
 */
export async function setActiveTenant(tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}
