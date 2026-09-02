-- =============================================================================
-- 010 - Indices por tenant_id
-- =============================================================================
-- Toda query de la app filtra (implicita o explicitamente via RLS) por
-- tenant_id, asi que cada tabla de negocio necesita ese indice como minimo.
-- Compuestos adicionales en las tablas mas consultadas: pedidos, productos,
-- clientes, facturas.
-- =============================================================================

create index idx_usuarios_tenant_id on public.usuarios (tenant_id);
create index idx_zonas_tenant_id on public.zonas (tenant_id);
create index idx_clientes_tenant_id on public.clientes (tenant_id);
create index idx_categorias_producto_tenant_id on public.categorias_producto (tenant_id);
create index idx_productos_tenant_id on public.productos (tenant_id);
create index idx_pedidos_tenant_id on public.pedidos (tenant_id);
create index idx_pedido_items_tenant_id on public.pedido_items (tenant_id);
create index idx_pedido_historial_tenant_id on public.pedido_historial (tenant_id);
create index idx_movimientos_inventario_tenant_id on public.movimientos_inventario (tenant_id);
create index idx_plantillas_pedido_tenant_id on public.plantillas_pedido (tenant_id);
create index idx_facturas_tenant_id on public.facturas (tenant_id);
create index idx_detalle_factura_tenant_id on public.detalle_factura (tenant_id);
create index idx_pagos_tenant_id on public.pagos (tenant_id);

-- Compuestos: pedidos
create index idx_pedidos_tenant_estado on public.pedidos (tenant_id, estado);
create index idx_pedidos_tenant_cliente on public.pedidos (tenant_id, cliente_id);
create index idx_pedidos_tenant_zona on public.pedidos (tenant_id, zona_id);
create index idx_pedidos_tenant_fecha_pedido on public.pedidos (tenant_id, fecha_pedido);
create index idx_pedido_items_tenant_pedido on public.pedido_items (tenant_id, pedido_id);

-- Compuestos: productos
create index idx_productos_tenant_categoria on public.productos (tenant_id, categoria_id);
create index idx_productos_tenant_activo on public.productos (tenant_id, activo);

-- Compuestos: clientes
create index idx_clientes_tenant_zona on public.clientes (tenant_id, zona_id);
create index idx_clientes_tenant_activo on public.clientes (tenant_id, activo);

-- Compuestos: facturas
create index idx_facturas_tenant_estado on public.facturas (tenant_id, estado);
create index idx_facturas_tenant_pedido on public.facturas (tenant_id, pedido_id);
