"use server";

import { revalidatePath } from "next/cache";
import { getDevTenant } from "@/lib/dev-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { siguienteEstado, type EstadoPedido } from "@/lib/data/pedidos";

/** Avanza un pedido al siguiente estado del flujo y deja rastro en pedido_historial. */
export async function avanzarEstadoPedido(formData: FormData) {
  const tenant = await getDevTenant();
  if (!tenant) throw new Error("No hay tenant activo");

  const pedidoId = String(formData.get("pedidoId") ?? "");
  const estadoActual = String(formData.get("estadoActual") ?? "") as EstadoPedido;

  const nuevoEstado = siguienteEstado(estadoActual);
  if (!nuevoEstado) return;

  const supabase = createAdminClient();

  const timestamps: Record<string, string> = {};
  if (nuevoEstado === "despachado") timestamps.despachado_at = new Date().toISOString();
  if (nuevoEstado === "entregado") timestamps.entregado_at = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("pedidos")
    .update({ estado: nuevoEstado, ...timestamps })
    .eq("id", pedidoId)
    .eq("tenant_id", tenant.id);

  if (updateError) throw updateError;

  const { error: historialError } = await supabase.from("pedido_historial").insert({
    tenant_id: tenant.id,
    pedido_id: pedidoId,
    estado_anterior: estadoActual,
    estado_nuevo: nuevoEstado,
    comentario: "Actualizado desde el panel de despacho (demo)",
  });

  if (historialError) throw historialError;

  revalidatePath("/despacho");
}
