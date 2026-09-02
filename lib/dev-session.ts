import { cookies } from "next/headers";

/**
 * SOLO PARA DEMO/DESARROLLO. Sustituye una sesion real de Supabase Auth
 * (JWT con app_metadata.tenant_id) mientras no esta cableado el flujo de
 * login completo (OTP/magic link/OAuth + signup flow, ver README-arquitectura.md).
 *
 * Guarda el tenant "logueado" en una cookie de solo servidor. Las paginas
 * bajo app/(dashboard) leen esta cookie para saber que tenant mostrar, y las
 * Server Actions la usan para scopear cada INSERT/UPDATE/SELECT via el
 * cliente admin (service_role) — nunca confiar en un tenant_id que venga del
 * cliente/formulario.
 *
 * TODO: reemplazar por una sesion real de Supabase Auth (JWT con
 * app_metadata.tenant_id) + RLS, y borrar este archivo.
 */

const COOKIE_NAME = "dev_tenant_id";

export type DevTenant = {
  id: string;
  slug: string;
  nombreEmpresa: string;
  etiquetaDemo: string;
};

// Debe coincidir con los tenants creados en supabase/seed.sql (ids fijos 1 y 2).
// id es string porque es el valor crudo de la cookie; PostgREST castea a bigint.
export const DEMO_TENANTS: DevTenant[] = [
  {
    id: "1",
    slug: "distribuidora-uno",
    nombreEmpresa: "Distribuidora Uno",
    etiquetaDemo: "Cliente X",
  },
  {
    id: "2",
    slug: "ferreteria-el-sol",
    nombreEmpresa: "Ferretería El Sol",
    etiquetaDemo: "Cliente Y",
  },
];

export async function getDevTenant(): Promise<DevTenant | null> {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get(COOKIE_NAME)?.value;
  return DEMO_TENANTS.find((t) => t.id === tenantId) ?? null;
}

export async function setDevTenant(tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearDevTenant() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
