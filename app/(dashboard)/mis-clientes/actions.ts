"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Crea un pedido "desde dentro de la app" para un cliente del tenant activo:
 * calcula precios desde productos (nunca confia en el precio que mande el
 * formulario), inserta pedidos + pedido_items en la misma operacion.
 */
export async function crearPedido(formData: FormData) {
  const tenant = await getSession();
  if (!tenant) throw new Error("No hay tenant activo");

  const clienteId = String(formData.get("clienteId") ?? "");
  const supabase = createAdminClient();

  const { data: productos, error: productosError } = await supabase
    .from("productos")
    .select("id, precio")
    .eq("tenant_id", tenant.id);
  if (productosError) throw productosError;

  const items = productos
    .map((producto) => {
      const cantidad = Number(formData.get(`cantidad_${producto.id}`) ?? 0);
      return { producto, cantidad };
    })
    .filter((item) => item.cantidad > 0);

  if (items.length === 0) {
    throw new Error("Elegí al menos un producto con cantidad mayor a cero.");
  }

  const subtotal = items.reduce(
    (acc, item) => acc + item.cantidad * item.producto.precio,
    0,
  );

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      tenant_id: tenant.id,
      cliente_id: clienteId,
      origen: "vendedor",
      estado: "confirmado",
      subtotal,
      descuento: 0,
      total: subtotal,
    })
    .select("id")
    .single();

  if (pedidoError) throw pedidoError;

  const { error: itemsError } = await supabase.from("pedido_items").insert(
    items.map((item) => ({
      tenant_id: tenant.id,
      pedido_id: pedido.id,
      producto_id: item.producto.id,
      cantidad: item.cantidad,
      precio_unitario: item.producto.precio,
      subtotal: item.cantidad * item.producto.precio,
    })),
  );

  if (itemsError) throw itemsError;

  redirect("/despacho");
}
