import { createAdminClient } from "@/lib/supabase/admin";
import type { EstadoPedido } from "@/lib/data/pedidos";

/**
 * A diferencia de getPedidosParaDespacho (lib/data/pedidos.ts), esto trae
 * TODOS los pedidos del tenant sin filtrar por estado — para reportes,
 * dashboard y exportacion (PDF/CSV), donde interesa el historico completo.
 */

export type PedidoReporte = {
  id: number;
  numero_pedido: number;
  estado: EstadoPedido;
  fecha_pedido: string;
  subtotal: number;
  descuento: number;
  total: number;
  cliente: { id: number; nombre_negocio: string } | null;
  items: {
    cantidad: number;
    subtotal: number;
    producto: { nombre: string } | null;
  }[];
};

export async function getPedidosReporte(
  tenantId: string,
): Promise<PedidoReporte[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `id, numero_pedido, estado, fecha_pedido, subtotal, descuento, total,
       cliente:clientes ( id, nombre_negocio ),
       items:pedido_items ( cantidad, subtotal, producto:productos ( nombre ) )`,
    )
    .eq("tenant_id", tenantId)
    .order("fecha_pedido", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PedidoReporte[];
}
