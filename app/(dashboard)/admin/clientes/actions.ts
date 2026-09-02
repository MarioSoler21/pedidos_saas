"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireTenant, parseId, pgErrorState } from "@/lib/admin-action-utils";
import { parseForm, clienteSchema, type FormState } from "@/lib/validation/admin";

export async function crearCliente(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const parsed = parseForm(clienteSchema, formData);
  if (!parsed.ok) return parsed.state;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("clientes")
    .insert({ ...parsed.data, tenant_id: tenant.id });
  if (error) return pgErrorState(error);

  revalidatePath("/admin/clientes");
  revalidatePath("/mis-clientes");
  return { ok: true };
}

export async function actualizarCliente(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };
  const parsed = parseForm(clienteSchema, formData);
  if (!parsed.ok) return parsed.state;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("clientes")
    .update(parsed.data)
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidatePath("/admin/clientes");
  revalidatePath("/mis-clientes");
  return { ok: true };
}

export async function setActivoCliente(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };
  const activo = formData.get("activo") === "true";

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("clientes")
    .update({ activo })
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidatePath("/admin/clientes");
  revalidatePath("/mis-clientes");
  return { ok: true };
}

export async function regenerarTokenCliente(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const id = parseId(formData);
  if (!id) return { ok: false, error: "ID inválido." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("clientes")
    .update({ token_unico: crypto.randomUUID() })
    .eq("id", id)
    .eq("tenant_id", tenant.id);
  if (error) return pgErrorState(error);

  revalidatePath("/admin/clientes");
  return { ok: true };
}
