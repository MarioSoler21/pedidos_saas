import { z } from "zod";

/**
 * Esquemas de validación para las server actions de /admin. Reciben el objeto
 * plano de un FormData (Object.fromEntries), así que todo entra como string.
 */

const requerido = z.string().trim().min(1, "Requerido");
const textoOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v));
const booleano = z
  .enum(["true", "false"])
  .transform((v) => v === "true");
const idOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isInteger(v) && v > 0), "Inválido");
const montoNoNegativo = z.coerce
  .number()
  .refine((v) => Number.isFinite(v) && v >= 0, "No puede ser negativo");

export const ROLES = [
  "admin",
  "vendedor",
  "despacho",
  "operador_bodega",
  "cliente_portal",
] as const;

export const UNIDADES = [
  "unidad",
  "caja",
  "saco",
  "libra",
  "kg",
  "litro",
  "docena",
] as const;

export const PLANES = ["starter", "pro", "enterprise"] as const;

export const TIPOS_CLIENTE = [
  "pulperia",
  "minimarket",
  "mayorista",
  "contratista",
  "reventa",
  "otro",
] as const;

export const usuarioSchema = z.object({
  nombre: requerido,
  rol: z.enum(ROLES),
  telefono: textoOpcional,
  pin: textoOpcional,
  activo: booleano,
});

export const clienteSchema = z.object({
  nombre_negocio: requerido,
  nombre_contacto: textoOpcional,
  telefono: textoOpcional,
  direccion: textoOpcional,
  zona_id: idOpcional,
  tipo_cliente: textoOpcional,
  notas: textoOpcional,
  activo: booleano,
});

export const productoSchema = z.object({
  sku: requerido,
  nombre: requerido,
  categoria_id: idOpcional,
  unidad_medida: z.enum(UNIDADES),
  precio: montoNoNegativo,
  costo: montoNoNegativo,
  stock_minimo: montoNoNegativo,
  activo: booleano,
});

export const zonaSchema = z.object({
  nombre: requerido,
  descripcion: textoOpcional,
  orden: z.coerce.number().int().refine((v) => Number.isFinite(v), "Inválido"),
  activa: booleano,
});

export const categoriaSchema = z.object({
  nombre: requerido,
});

export const tenantConfigSchema = z.object({
  nombre_empresa: requerido,
  slug: z
    .string()
    .trim()
    .min(1, "Requerido")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  plan: z.enum(PLANES),
});

export type FormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Corre un schema sobre un FormData y devuelve datos tipados o un FormState de error. */
export function parseForm<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): { ok: true; data: z.infer<T> } | { ok: false; state: FormState } {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (parsed.success) return { ok: true, data: parsed.data };
  const flat = z.flattenError(parsed.error);
  return {
    ok: false,
    state: {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    },
  };
}
