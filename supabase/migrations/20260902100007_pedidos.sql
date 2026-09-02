-- =============================================================================
-- 007 - pedidos, pedido_items, pedido_historial, plantillas_pedido
-- =============================================================================
-- Nada se borra fisicamente: un pedido se anula (estado = 'anulado'), nunca
-- DELETE. Todo cambio de estado queda en pedido_historial (lo escribe la app
-- en el mismo request que hace el UPDATE de estado, no un trigger, para poder
-- adjuntar comentario/empleado_id).
--
-- id/tenant_id/FKs son bigint. numero_pedido es un correlativo POR TENANT
-- (integer), no la PK.
-- =============================================================================

create table public.pedidos (
  id              bigint generated always as identity primary key,
  tenant_id       bigint not null references public.tenants(id),
  numero_pedido   integer not null,
  cliente_id      bigint not null references public.clientes(id),
  zona_id         bigint references public.zonas(id),
  vendedor_id     bigint references public.usuarios(id),
  repartidor_id   bigint references public.usuarios(id),
  origen          text not null default 'vendedor' check (origen in ('vendedor', 'cliente_portal', 'admin')),
  fecha_pedido    timestamptz not null default now(),
  fecha_entrega   date,
  estado          text not null default 'pendiente'
                    check (estado in ('pendiente', 'confirmado', 'en_preparacion', 'despachado', 'entregado', 'anulado')),
  despachado_at   timestamptz,
  despachado_por  bigint references public.usuarios(id),
  entregado_at    timestamptz,
  subtotal        numeric(12, 2) not null default 0,
  descuento       numeric(12, 2) not null default 0,
  total           numeric(12, 2) not null default 0,
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint pedidos_tenant_numero_pedido_key unique (tenant_id, numero_pedido)
);

comment on table public.pedidos is
  'Pedidos por tenant. numero_pedido es correlativo por tenant (ver public.siguiente_numero) y se autocompleta via trigger si no viene explicito.';

drop trigger if exists trg_pedidos_set_updated_at on public.pedidos;
create trigger trg_pedidos_set_updated_at
  before update on public.pedidos
  for each row
  execute function public.set_updated_at();

-- Autocompleta numero_pedido si no viene explicito. Nombrado trg_20_ para
-- que corra DESPUES de trg_10_set_tenant_id (migracion 012): necesita
-- new.tenant_id ya resuelto.
create or replace function public.set_numero_pedido()
returns trigger
language plpgsql
as $$
begin
  if new.numero_pedido is null then
    new.numero_pedido := public.siguiente_numero(new.tenant_id, 'pedido');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_20_set_numero_pedido on public.pedidos;
create trigger trg_20_set_numero_pedido
  before insert on public.pedidos
  for each row
  execute function public.set_numero_pedido();

-- ---------------------------------------------------------------------------

create table public.pedido_items (
  id              bigint generated always as identity primary key,
  tenant_id       bigint not null references public.tenants(id),
  pedido_id       bigint not null references public.pedidos(id),
  producto_id     bigint not null references public.productos(id),
  cantidad        numeric(12, 2) not null,
  precio_unitario numeric(12, 2) not null,
  subtotal        numeric(12, 2) not null,
  created_at      timestamptz not null default now()
);

comment on table public.pedido_items is
  'Lineas de un pedido. Se insertan una vez y no se editan; para corregir cantidades se anula el pedido y se crea uno nuevo.';

-- ---------------------------------------------------------------------------

create table public.pedido_historial (
  id              bigint generated always as identity primary key,
  tenant_id       bigint not null references public.tenants(id),
  pedido_id       bigint not null references public.pedidos(id),
  estado_anterior text,
  estado_nuevo    text not null,
  empleado_id     bigint references public.usuarios(id),
  comentario      text,
  created_at      timestamptz not null default now()
);

comment on table public.pedido_historial is
  'Log append-only de cada cambio de estado de un pedido.';

-- ---------------------------------------------------------------------------

create table public.plantillas_pedido (
  id                 bigint generated always as identity primary key,
  tenant_id          bigint not null references public.tenants(id),
  cliente_id         bigint not null references public.clientes(id),
  producto_id        bigint not null references public.productos(id),
  dia_semana         integer not null check (dia_semana between 0 and 6),
  cantidad_sugerida  numeric(12, 2) not null,
  created_at         timestamptz not null default now()
);

comment on table public.plantillas_pedido is
  'Plan de pedido recurrente sugerido por cliente (dia_semana: 0=domingo .. 6=sabado).';
