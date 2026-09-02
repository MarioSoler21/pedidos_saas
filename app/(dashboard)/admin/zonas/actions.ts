"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireTenant, parseId, pgErrorState } from "@/lib/admin-action-utils";
import { parseForm, zonaSchema, type FormState } from "@/lib/validation/admin";

export async function crearZona(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const parsed = parseForm(zonaSchema, formData);
  if (!parsed.ok) return parsed.state;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("zonas")
    .insert({ ...parsed.data, tenant_id: tenant.id });
  if (error) return pgErrorState(error);

  revalidatePath("/admin/zonas");
  return { ok: true };
}

export async function actualizarZona(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };
  const parsed = parseForm(zonaSchema, formData);
  if (!parsed.ok) return parsed.state;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("zonas")
    .update(parsed.data)
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidatePath("/admin/zonas");
  return { ok: true };
}

export async function setActivoZona(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };
  const activa = formData.get("activo") === "true";

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("zonas")
    .update({ activa })
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidatePath("/admin/zonas");
  return { ok: true };
}

export async function eliminarZona(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("zonas")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidatePath("/admin/zonas");
  return { ok: true };
}
