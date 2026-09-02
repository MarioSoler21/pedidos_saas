-- =============================================================================
-- 005 - clientes
-- =============================================================================
-- token_unico habilita /pedido/[token]: el cliente hace su pedido sin login.
-- Es unico POR TENANT (dos tenants pueden, en teoria, generar el mismo valor
-- sin chocar), nunca global. Sigue siendo un token opaco aleatorio (no un id).
-- =============================================================================

create table public.clientes (
  id              bigint generated always as identity primary key,
  tenant_id       bigint not null references public.tenants(id),
  nombre_negocio  text not null,
  nombre_contacto text,
  telefono        text,
  direccion       text,
  zona_id         bigint references public.zonas(id),
  tipo_cliente    text,
  token_unico     text not null default gen_random_uuid()::text,
  notas           text,
  activo          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint clientes_tenant_token_unico_key unique (tenant_id, token_unico)
);

comment on table public.clientes is
  'Clientes (negocios) de cada tenant.';
comment on column public.clientes.token_unico is
  'Token opaco usado en /pedido/[token] para que el cliente pida sin login. Unico por tenant.';

drop trigger if exists trg_clientes_set_updated_at on public.clientes;
create trigger trg_clientes_set_updated_at
  before update on public.clientes
  for each row
  execute function public.set_updated_at();
