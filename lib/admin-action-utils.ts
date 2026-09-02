import { getDevTenant } from "@/lib/dev-session";
import type { FormState } from "@/lib/validation/admin";

/** Módulo de helpers para las server actions de /admin (no es "use server"). */

export async function requireTenant() {
  const tenant = await getDevTenant();
  if (!tenant) throw new Error("No hay tenant activo");
  return tenant;
}

export function parseId(formData: FormData): number | null {
  const id = Number(formData.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function pgErrorState(err: unknown): FormState {
  const e = err as { code?: string; message?: string };
  if (e?.code === "23505") {
    return {
      ok: false,
      error: "Ya existe un registro con ese valor único (ej. SKU o slug repetido).",
    };
  }
  if (e?.code === "23503") {
    return {
      ok: false,
      error: "Está en uso por otras filas, no se puede eliminar.",
    };
  }
  return { ok: false, error: e?.message ?? "Ocurrió un error inesperado." };
}
