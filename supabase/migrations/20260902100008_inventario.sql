-- =============================================================================
-- 008 - movimientos_inventario
-- =============================================================================
-- Todo movimiento de stock queda registrado aqui (append-only). stock_actual
-- en productos se actualiza desde la app en la misma transaccion que inserta
-- el movimiento.
-- =============================================================================

create table public.movimientos_inventario (
  id           bigint generated always as identity primary key,
  tenant_id    bigint not null references public.tenants(id),
  producto_id  bigint not null references public.productos(id),
  tipo         text not null check (tipo in ('entrada', 'salida', 'ajuste')),
  cantidad     numeric(12, 2) not null,
  motivo       text,
  empleado_id  bigint references public.usuarios(id),
  created_at   timestamptz not null default now()
);

comment on table public.movimientos_inventario is
  'Log append-only de movimientos de stock por producto (entrada/salida/ajuste).';
