"use server";

import { redirect } from "next/navigation";
import { DEMO_TENANTS, setDevTenant } from "@/lib/dev-session";

/**
 * SOLO DEMO: "login" hardcodeado que fija el tenant activo en una cookie.
 * Sustituye al signup/login flow real de Supabase Auth (ver README-arquitectura.md).
 */
export async function entrarComoTenant(formData: FormData) {
  const tenantId = String(formData.get("tenantId") ?? "");

  if (!DEMO_TENANTS.some((t) => t.id === tenantId)) {
    throw new Error("Tenant demo invalido");
  }

  await setDevTenant(tenantId);
  redirect("/despacho");
}
