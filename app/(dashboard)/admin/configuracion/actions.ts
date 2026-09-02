"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireTenant, pgErrorState } from "@/lib/admin-action-utils";
import {
  parseForm,
  tenantConfigSchema,
  type FormState,
} from "@/lib/validation/admin";

const EXT_POR_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function revalidarMarca() {
  revalidatePath("/admin/configuracion");
  revalidatePath("/", "layout");
}

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

  revalidarMarca();
  return { ok: true };
}

export async function subirLogoTenant(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenant = await requireTenant();
  const file = formData.get("logo");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Elegí un archivo de imagen." };
  }
  if (!EXT_POR_MIME[file.type]) {
    return { ok: false, error: "Formato no soportado (PNG, JPG, WEBP o SVG)." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: "El archivo supera los 2 MB." };
  }

  const supabase = createAdminClient();
  const path = `tenant-${tenant.id}/logo-${Date.now()}.${EXT_POR_MIME[file.type]}`;

  const { error: upErr } = await supabase.storage
    .from("branding")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (upErr) return { ok: false, error: upErr.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("branding").getPublicUrl(path);

  const { error } = await supabase
    .from("tenants")
    .update({ logo_url: publicUrl })
    .eq("id", tenant.id);
  if (error) return pgErrorState(error);

  revalidarMarca();
  return { ok: true };
}

export async function quitarLogoTenant(): Promise<FormState> {
  const tenant = await requireTenant();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tenants")
    .update({ logo_url: null })
    .eq("id", tenant.id);
  if (error) return pgErrorState(error);

  revalidarMarca();
  return { ok: true };
}
