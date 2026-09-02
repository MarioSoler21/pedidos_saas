"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireTenant, pgErrorState } from "@/lib/admin-action-utils";
import {
  parseForm,
  tenantConfigSchema,
  type FormState,
} from "@/lib/validation/admin";

export async function actualizarConfiguracion(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const parsed = parseForm(tenantConfigSchema, formData);
  if (!parsed.ok) return parsed.state;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tenants")
    .update(parsed.data)
    .eq("id", tenant.id);
  if (error) return pgErrorState(error);

  revalidatePath("/admin/configuracion");
  return { ok: true };
}
