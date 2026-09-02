-- =============================================================================
-- 012 - Trigger BEFORE INSERT: autocompletar tenant_id desde el JWT
-- =============================================================================
-- Hace imposible insertar una fila sin tenant_id "por olvido" en el codigo de
-- la app: si no viene explicito en el INSERT, se completa con
-- current_tenant_id(). Si tampoco hay JWT con el claim, el INSERT falla.
--
-- Nombrado trg_10_set_tenant_id a proposito: Postgres dispara los triggers
-- BEFORE INSERT de una misma tabla en orden alfabetico por nombre, y
-- pedidos/facturas tienen un segundo trigger (trg_20_set_numero_pedido /
-- trg_20_set_correlativo, migraciones 007 y 009) que necesita new.tenant_id
-- YA resuelto para poder pedir el siguiente correlativo de ESE tenant.
-- =============================================================================

create or replace function public.set_tenant_id_from_jwt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.tenant_id is null then
    new.tenant_id := public.current_tenant_id();
  end if;

  if new.tenant_id is null then
    raise exception
      'No se pudo determinar tenant_id: el JWT no trae el claim app_metadata.tenant_id y el INSERT no lo especifico explicitamente.';
  end if;

  return new;
end;
$$;

comment on function public.set_tenant_id_from_jwt() is
  'Trigger BEFORE INSERT: si tenant_id viene null, lo completa con current_tenant_id(). Falla el INSERT si no hay forma de resolverlo.';

do $$
declare
  tabla text;
  tablas text[] := array[
    'usuarios',
    'zonas',
    'clientes',
    'categorias_producto',
    'productos',
    'pedidos',
    'pedido_items',
    'pedido_historial',
    'movimientos_inventario',
    'plantillas_pedido',
    'facturas',
    'detalle_factura',
    'pagos'
  ];
begin
  foreach tabla in array tablas loop
    execute format('drop trigger if exists trg_set_tenant_id on public.%I', tabla);
    execute format('drop trigger if exists trg_10_set_tenant_id on public.%I', tabla);
    execute format(
      'create trigger trg_10_set_tenant_id
         before insert on public.%I
         for each row
         execute function public.set_tenant_id_from_jwt()',
      tabla
    );
  end loop;
end;
$$;
