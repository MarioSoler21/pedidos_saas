"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { getClientePorToken } from "@/lib/data/portal";

/**
 * Envia el pedido del portal de cliente (sin login). Reresuelve el cliente y
 * el tenant desde el token en el servidor: del formulario solo se usan las
 * cantidades. Los precios se leen de productos, nunca del form.
 */
export async function enviarPedidoCliente(formData: FormData) {
  const token = String(formData.get("token") ?? "");

  const cliente = await getClientePorToken(token);
  if (!cliente) {
    throw new Error("Token invalido o cliente inactivo.");
  }

  const supabase = createAdminClient();

  const { data: productos, error: productosError } = await supabase
    .from("productos")
    .select("id, precio")
    .eq("tenant_id", cliente.tenant_id)
    .eq("activo", true);
  if (productosError) throw productosError;

  const items = (productos ?? [])
    .map((producto) => ({
      producto,
      cantidad: Number(formData.get(`cantidad_${producto.id}`) ?? 0),
    }))
    .filter((item) => Number.isFinite(item.cantidad) && item.cantidad > 0);

  if (items.length === 0) {
    throw new Error("Agregá al menos un producto al carrito.");
  }

  const subtotal = items.reduce(
    (acc, item) => acc + item.cantidad * Number(item.producto.precio),
    0,
  );

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      tenant_id: cliente.tenant_id,
      cliente_id: cliente.id,
      origen: "cliente_portal",
      estado: "pendiente",
      subtotal,
      descuento: 0,
      total: subtotal,
    })
    .select("id, numero_pedido")
    .single();
  if (pedidoError) throw pedidoError;

  const { error: itemsError } = await supabase.from("pedido_items").insert(
    items.map((item) => ({
      tenant_id: cliente.tenant_id,
      pedido_id: pedido.id,
      producto_id: item.producto.id,
      cantidad: item.cantidad,
      precio_unitario: Number(item.producto.precio),
      subtotal: item.cantidad * Number(item.producto.precio),
    })),
  );
  if (itemsError) throw itemsError;

  redirect(
    `/pedidos/${encodeURIComponent(token)}/cliente?pedido=${pedido.numero_pedido}`,
  );
}
