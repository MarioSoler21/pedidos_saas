import { createAdminClient } from "@/lib/supabase/admin";

export const FLUJO_ESTADOS = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "despachado",
  "entregado",
] as const;

export type EstadoPedido = (typeof FLUJO_ESTADOS)[number] | "anulado";

export function siguienteEstado(estado: EstadoPedido): EstadoPedido | null {
  const idx = FLUJO_ESTADOS.indexOf(estado as (typeof FLUJO_ESTADOS)[number]);
  if (idx === -1 || idx === FLUJO_ESTADOS.length - 1) return null;
  return FLUJO_ESTADOS[idx + 1];
}

export type PedidoParaDespacho = {
  id: number;
  numero_pedido: number;
  estado: EstadoPedido;
  fecha_pedido: string;
  total: number;
  cliente: { nombre_negocio: string } | null;
  items: { cantidad: number; producto: { nombre: string } | null }[];
};

/** Pedidos relevantes para el panel de despacho: todo lo que no esta ya cerrado. */
export async function getPedidosParaDespacho(
  tenantId: string,
): Promise<PedidoParaDespacho[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `id, numero_pedido, estado, fecha_pedido, total,
       cliente:clientes ( nombre_negocio ),
       items:pedido_items ( cantidad, producto:productos ( nombre ) )`,
    )
    .eq("tenant_id", tenantId)
    .in("estado", ["pendiente", "confirmado", "en_preparacion", "despachado"])
    .order("fecha_pedido", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as PedidoParaDespacho[];
}
