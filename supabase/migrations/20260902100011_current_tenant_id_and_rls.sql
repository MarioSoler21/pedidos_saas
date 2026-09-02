-- =============================================================================
-- 011 - current_tenant_id() + Row Level Security en todas las tablas de negocio
-- =============================================================================
-- current_tenant_id() lee el tenant_id desde el claim app_metadata del JWT de
-- Supabase Auth. app_metadata solo puede escribirlo el backend (service_role
-- o Admin API), nunca el propio usuario, por eso es el lugar correcto para
-- guardar el tenant_id (a diferencia de user_metadata).
--
-- tenant_id es bigint, asi que el claim se castea a bigint.
--
-- Cada tabla de negocio recibe una policy FOR ALL que exige
-- tenant_id = current_tenant_id() tanto para USING (filas visibles/editables)
-- como para WITH CHECK (filas que se pueden insertar/actualizar).
--
-- tenant_contadores tambien queda protegido: solo se toca via
-- public.siguiente_numero(), invocado dentro de un INSERT en pedidos/facturas
-- que ya paso por la misma policy de tenant.
--
-- Importante: el rol operador_bodega (login por PIN, sin sesion Supabase
-- Auth) y el portal de cliente por token_unico (sin login) no tienen JWT de
-- usuario. Esos flujos se resuelven en rutas de servidor (API routes) usando
-- el service_role key (lib/supabase/admin.ts), que bypassa RLS por diseno de
-- Postgres/Supabase. Ver README-arquitectura.md para el detalle.
-- =============================================================================

create or replace function public.current_tenant_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::bigint
$$;

comment on function public.current_tenant_id() is
  'Devuelve el tenant_id del usuario autenticado, leido de app_metadata.tenant_id en el JWT. Null si no hay sesion o no tiene el claim.';

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
    'pagos',
    'tenant_contadores'
  ];
begin
  foreach tabla in array tablas loop
    execute format('alter table public.%I enable row level security', tabla);
    execute format('alter table public.%I force row level security', tabla);

    execute format('drop policy if exists tenant_isolation on public.%I', tabla);
    execute format(
      'create policy tenant_isolation on public.%I
         for all
         using (tenant_id = public.current_tenant_id())
         with check (tenant_id = public.current_tenant_id())',
      tabla
    );
  end loop;
end;
$$;
