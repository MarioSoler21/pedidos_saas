"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireTenant, parseId, pgErrorState } from "@/lib/admin-action-utils";
import { parseForm, categoriaSchema, type FormState } from "@/lib/validation/admin";

export async function crearCategoria(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const parsed = parseForm(categoriaSchema, formData);
  if (!parsed.ok) return parsed.state;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("categorias_producto")
    .insert({ ...parsed.data, tenant_id: tenant.id });
  if (error) return pgErrorState(error);

  revalidatePath("/admin/categorias");
  return { ok: true };
}

export async function actualizarCategoria(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };
  const parsed = parseForm(categoriaSchema, formData);
  if (!parsed.ok) return parsed.state;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("categorias_producto")
    .update(parsed.data)
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidatePath("/admin/categorias");
  return { ok: true };
}

export async function eliminarCategoria(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("categorias_producto")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return { ok: true };
}
