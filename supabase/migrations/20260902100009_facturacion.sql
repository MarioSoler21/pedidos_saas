-- =============================================================================
-- 009 - facturas, detalle_factura, pagos
-- =============================================================================
-- Igual que pedidos: una factura se anula (estado = 'anulada'), nunca DELETE.
-- correlativo es por tenant (ver public.siguiente_numero), autocompletado via
-- trigger si no viene explicito.
--
-- id/tenant_id/FKs son bigint. correlativo es un correlativo por tenant
-- (integer), no la PK.
-- =============================================================================

create table public.facturas (
  id           bigint generated always as identity primary key,
  tenant_id    bigint not null references public.tenants(id),
  pedido_id    bigint not null references public.pedidos(id),
  correlativo  integer not null,
  subtotal     numeric(12, 2) not null default 0,
  isv          numeric(12, 2) not null default 0,
  total        numeric(12, 2) not null default 0,
  estado       text not null default 'emitida' check (estado in ('emitida', 'pagada', 'anulada')),
  fecha        timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint facturas_tenant_correlativo_key unique (tenant_id, correlativo)
);

comment on table public.facturas is
  'Facturas por tenant. correlativo es correlativo por tenant (ver public.siguiente_numero).';

drop trigger if exists trg_facturas_set_updated_at on public.facturas;
create trigger trg_facturas_set_updated_at
  before update on public.facturas
  for each row
  execute function public.set_updated_at();

-- Autocompleta correlativo si no viene explicito. Nombrado trg_20_ para
-- correr DESPUES de trg_10_set_tenant_id (migracion 012).
create or replace function public.set_correlativo_factura()
returns trigger
language plpgsql
as $$
begin
  if new.correlativo is null then
    new.correlativo := public.siguiente_numero(new.tenant_id, 'factura');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_20_set_correlativo on public.facturas;
create trigger trg_20_set_correlativo
  before insert on public.facturas
  for each row
  execute function public.set_correlativo_factura();

-- ---------------------------------------------------------------------------

create table public.detalle_factura (
  id              bigint generated always as identity primary key,
  tenant_id       bigint not null references public.tenants(id),
  factura_id      bigint not null references public.facturas(id),
  producto_id     bigint not null references public.productos(id),
  cantidad        numeric(12, 2) not null,
  precio_unitario numeric(12, 2) not null,
  importe         numeric(12, 2) not null
);

comment on table public.detalle_factura is
  'Lineas de una factura.';

-- ---------------------------------------------------------------------------

create table public.pagos (
  id          bigint generated always as identity primary key,
  tenant_id   bigint not null references public.tenants(id),
  factura_id  bigint not null references public.facturas(id),
  monto       numeric(12, 2) not null,
  metodo      text not null check (metodo in ('efectivo', 'transferencia', 'credito')),
  fecha       timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

comment on table public.pagos is
  'Pagos aplicados a una factura. Una factura puede tener varios pagos parciales.';
