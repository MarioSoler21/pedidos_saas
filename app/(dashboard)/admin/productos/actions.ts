"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireTenant, parseId, pgErrorState } from "@/lib/admin-action-utils";
import { parseForm, productoSchema, type FormState } from "@/lib/validation/admin";

function revalidate() {
  revalidatePath("/admin/productos");
  revalidatePath("/mis-clientes");
  revalidatePath("/despacho");
}

export async function crearProducto(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const parsed = parseForm(productoSchema, formData);
  if (!parsed.ok) return parsed.state;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("productos")
    .insert({ ...parsed.data, tenant_id: tenant.id });
  if (error) return pgErrorState(error);

  revalidate();
  return { ok: true };
}

export async function actualizarProducto(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };
  const parsed = parseForm(productoSchema, formData);
  if (!parsed.ok) return parsed.state;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("productos")
    .update(parsed.data)
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidate();
  return { ok: true };
}

export async function setActivoProducto(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };
  const activo = formData.get("activo") === "true";

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("productos")
    .update({ activo })
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidate();
  return { ok: true };
}
