"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setActiveTenant } from "@/lib/session";

export async function salirDelTenant() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Cambia el negocio activo entre los tenants a los que pertenece el usuario logueado. */
export async function cambiarNegocio(formData: FormData) {
  const tenantId = String(formData.get("tenantId") ?? "");
  await setActiveTenant(tenantId);
  redirect("/despacho");
}
