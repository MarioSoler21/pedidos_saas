-- =============================================================================
-- seed.sql - Datos de ejemplo para probar aislamiento multi-tenant
-- =============================================================================
-- Crea DOS tenants completos (usuario admin, zonas, productos, clientes) con
-- nombres claramente distintos para poder verificar a simple vista que un
-- tenant NUNCA ve filas del otro (ej. logueado como admin del tenant A, la
-- query a productos no debe traer nada de "Ferreteria El Sol").
--
-- PKs bigint identity. Los tenants demo se fuerzan a id = 1 y id = 2
-- (overriding system value) para que coincidan con DEMO_TENANTS en
-- lib/dev-session.ts. El resto de ids los asigna la identidad y se capturan
-- con "returning id into" cuando hacen falta como FK mas adelante.
--
-- Nota: cada INSERT especifica tenant_id explicitamente, asi que el trigger
-- trg_10_set_tenant_id (que solo actua si tenant_id viene null) no
-- interfiere, y este script no depende de tener un JWT de sesion activo.
-- =============================================================================

do $$
declare
  tenant_uno bigint := 1;
  tenant_dos bigint := 2;

  zona_uno_centro   bigint;
  zona_uno_norte    bigint;
  cat_uno_bebidas   bigint;
  cat_uno_abarrotes bigint;

  prod_uno_cola  bigint;
  prod_uno_agua  bigint;
  prod_uno_arroz bigint;

  cliente_uno_pulperia   bigint;
  cliente_uno_minimarket bigint;

  pedido_uno_1 bigint;
  pedido_uno_2 bigint;
  pedido_uno_3 bigint;

  zona_dos_centro    bigint;
  zona_dos_sur       bigint;
  cat_dos_ferreteria bigint;
begin
  -- ---------------------------------------------------------------------
  -- Tenants demo con id fijo (1 y 2)
  -- ---------------------------------------------------------------------
  insert into public.tenants (id, nombre_empresa, slug, plan, activo)
  overriding system value
  values
    (tenant_uno, 'Distribuidora Uno', 'distribuidora-uno', 'starter', true),
    (tenant_dos, 'Ferreteria El Sol', 'ferreteria-el-sol', 'starter', true)
  on conflict (id) do nothing;

  -- Dejar la secuencia de identidad por delante de los ids fijados a mano
  perform setval(pg_get_serial_sequence('public.tenants', 'id'), 2, true);

  -- ---------------------------------------------------------------------
  -- Tenant 1: Distribuidora Uno
  -- ---------------------------------------------------------------------
  insert into public.usuarios (tenant_id, nombre, rol, telefono, activo)
  values (tenant_uno, 'Admin Uno', 'admin', '9999-0001', true);

  insert into public.zonas (tenant_id, nombre, descripcion, orden, activa)
  values (tenant_uno, 'Centro', 'Zona centro', 1, true)
  returning id into zona_uno_centro;

  insert into public.zonas (tenant_id, nombre, descripcion, orden, activa)
  values (tenant_uno, 'Norte', 'Zona norte', 2, true)
  returning id into zona_uno_norte;

  insert into public.categorias_producto (tenant_id, nombre)
  values (tenant_uno, 'Bebidas')
  returning id into cat_uno_bebidas;

  insert into public.categorias_producto (tenant_id, nombre)
  values (tenant_uno, 'Abarrotes')
  returning id into cat_uno_abarrotes;

  insert into public.productos
    (tenant_id, sku, nombre, categoria_id, unidad_medida, precio, costo, stock_actual, stock_minimo, activo)
  values (tenant_uno, 'BEB-001', 'Refresco Cola 355ml', cat_uno_bebidas, 'unidad', 12.50, 8.00, 200, 30, true)
  returning id into prod_uno_cola;

  insert into public.productos
    (tenant_id, sku, nombre, categoria_id, unidad_medida, precio, costo, stock_actual, stock_minimo, activo)
  values (tenant_uno, 'BEB-002', 'Agua Purificada 500ml', cat_uno_bebidas, 'unidad', 8.00, 5.00, 300, 50, true)
  returning id into prod_uno_agua;

  insert into public.productos
    (tenant_id, sku, nombre, categoria_id, unidad_medida, precio, costo, stock_actual, stock_minimo, activo)
  values (tenant_uno, 'ABR-001', 'Arroz 1lb', cat_uno_abarrotes, 'unidad', 15.00, 10.50, 150, 25, true)
  returning id into prod_uno_arroz;

  insert into public.productos
    (tenant_id, sku, nombre, categoria_id, unidad_medida, precio, costo, stock_actual, stock_minimo, activo)
  values
    (tenant_uno, 'BEB-003', 'Jugo Natural 1L',      cat_uno_bebidas,   'unidad', 25.00, 17.00, 100, 20, true),
    (tenant_uno, 'ABR-002', 'Frijol Rojo 1lb',      cat_uno_abarrotes, 'unidad', 18.00, 12.00, 120, 20, true),
    (tenant_uno, 'ABR-003', 'Aceite Vegetal 750ml', cat_uno_abarrotes, 'unidad', 45.00, 32.00,  80, 15, true);

  insert into public.clientes
    (tenant_id, nombre_negocio, nombre_contacto, telefono, direccion, zona_id, tipo_cliente, activo)
  values (tenant_uno, 'Pulperia La Esquina', 'Maria Lopez', '9988-1122', 'Barrio Centro, calle principal', zona_uno_centro, 'pulperia', true)
  returning id into cliente_uno_pulperia;

  insert into public.clientes
    (tenant_id, nombre_negocio, nombre_contacto, telefono, direccion, zona_id, tipo_cliente, activo)
  values (tenant_uno, 'Minimarket El Norte', 'Carlos Ramirez', '9977-3344', 'Colonia Norte, avenida 5', zona_uno_norte, 'minimarket', true)
  returning id into cliente_uno_minimarket;

  -- Pedidos de ejemplo, en distintos estados, para ver algo en el panel de
  -- despacho apenas se aplica el seed. numero_pedido lo asigna el trigger
  -- trg_20_set_numero_pedido (public.siguiente_numero) al no venir explicito.
  insert into public.pedidos
    (tenant_id, cliente_id, origen, estado, subtotal, descuento, total)
  values (tenant_uno, cliente_uno_pulperia, 'vendedor', 'pendiente',
          2 * 12.50 + 3 * 8.00, 0, 2 * 12.50 + 3 * 8.00)
  returning id into pedido_uno_1;

  insert into public.pedidos
    (tenant_id, cliente_id, origen, estado, subtotal, descuento, total)
  values (tenant_uno, cliente_uno_minimarket, 'vendedor', 'confirmado',
          10 * 15.00, 0, 10 * 15.00)
  returning id into pedido_uno_2;

  insert into public.pedidos
    (tenant_id, cliente_id, origen, estado, subtotal, descuento, total)
  values (tenant_uno, cliente_uno_pulperia, 'cliente_portal', 'en_preparacion',
          5 * 8.00 + 1 * 15.00, 0, 5 * 8.00 + 1 * 15.00)
  returning id into pedido_uno_3;

  insert into public.pedido_items
    (tenant_id, pedido_id, producto_id, cantidad, precio_unitario, subtotal)
  values
    (tenant_uno, pedido_uno_1, prod_uno_cola, 2, 12.50, 2 * 12.50),
    (tenant_uno, pedido_uno_1, prod_uno_agua, 3, 8.00, 3 * 8.00),
    (tenant_uno, pedido_uno_2, prod_uno_arroz, 10, 15.00, 10 * 15.00),
    (tenant_uno, pedido_uno_3, prod_uno_agua, 5, 8.00, 5 * 8.00),
    (tenant_uno, pedido_uno_3, prod_uno_arroz, 1, 15.00, 1 * 15.00);

  insert into public.pedido_historial (tenant_id, pedido_id, estado_anterior, estado_nuevo, comentario)
  values
    (tenant_uno, pedido_uno_2, 'pendiente', 'confirmado', 'Confirmado por el vendedor (seed)'),
    (tenant_uno, pedido_uno_3, 'pendiente', 'confirmado', 'Confirmado (seed)'),
    (tenant_uno, pedido_uno_3, 'confirmado', 'en_preparacion', 'Enviado a bodega (seed)');

  -- ---------------------------------------------------------------------
  -- Tenant 2: Ferreteria El Sol
  -- ---------------------------------------------------------------------
  insert into public.usuarios (tenant_id, nombre, rol, telefono, activo)
  values (tenant_dos, 'Admin Dos', 'admin', '9999-0002', true);

  insert into public.zonas (tenant_id, nombre, descripcion, orden, activa)
  values (tenant_dos, 'Centro', 'Zona centro', 1, true)
  returning id into zona_dos_centro;

  insert into public.zonas (tenant_id, nombre, descripcion, orden, activa)
  values (tenant_dos, 'Sur', 'Zona sur', 2, true)
  returning id into zona_dos_sur;

  insert into public.categorias_producto (tenant_id, nombre)
  values (tenant_dos, 'Ferreteria')
  returning id into cat_dos_ferreteria;

  insert into public.productos
    (tenant_id, sku, nombre, categoria_id, unidad_medida, precio, costo, stock_actual, stock_minimo, activo)
  values
    (tenant_dos, 'FER-001', 'Cemento 42.5kg',          cat_dos_ferreteria, 'saco',   180.00, 140.00, 60, 10, true),
    (tenant_dos, 'FER-002', 'Clavo 2 pulgadas 1lb',    cat_dos_ferreteria, 'libra',   25.00,  15.00, 200, 30, true),
    (tenant_dos, 'FER-003', 'Pintura Latex 1 galon',   cat_dos_ferreteria, 'unidad', 320.00, 240.00, 40,  8, true),
    (tenant_dos, 'FER-004', 'Tubo PVC 3/4" x 6m',      cat_dos_ferreteria, 'unidad',  95.00,  65.00, 75, 15, true),
    (tenant_dos, 'FER-005', 'Alambre Galvanizado 1lb', cat_dos_ferreteria, 'libra',   30.00,  20.00, 90, 20, true);

  insert into public.clientes
    (tenant_id, nombre_negocio, nombre_contacto, telefono, direccion, zona_id, tipo_cliente, activo)
  values
    (tenant_dos, 'Construcciones Del Valle', 'Jorge Martinez', '9966-5566', 'Zona Centro, boulevard principal', zona_dos_centro, 'contratista', true),
    (tenant_dos, 'Ferremax Sur', 'Ana Gomez', '9955-7788', 'Zona Sur, salida a carretera', zona_dos_sur, 'reventa', true);
end;
$$;
