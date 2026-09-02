-- =============================================================================
-- 002 - tenants (empresas clientes del SaaS) + contadores por tenant
-- =============================================================================
-- tenants: cada distribuidora que contrata el SaaS. Toda tabla de negocio
-- referencia tenant_id desde su creacion (no hay ALTER posterior).
--
-- tenant_contadores: soporta numero_pedido y correlativo de factura
-- correlativos POR TENANT (no globales) de forma segura ante concurrencia
-- (dos vendedores creando pedidos al mismo tiempo, en tenants distintos o en
-- el mismo). Se resuelve con un UPSERT atomico por (tenant_id, tipo), no con
-- un "select max(...)+1" que tiene condicion de carrera.
--
-- PKs: bigint generado por identidad (secuencia 1,2,3...). Toda FK entre
-- tablas de negocio es bigint. Unica excepcion: usuarios.auth_user_id, que
-- referencia auth.users(id) de Supabase (uuid, no es nuestra).
-- =============================================================================

create table public.tenants (
  id              bigint generated always as identity primary key,
  nombre_empresa  text not null,
  slug            text not null unique,
  plan            text not null default 'starter',
  activo          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.tenants is
  'Empresas (distribuidoras) que usan el SaaS. Toda tabla de negocio pertenece a un tenant.';
comment on column public.tenants.slug is
  'Identificador corto y unico usado en URLs/subdominios (ej. diprocar).';
comment on column public.tenants.plan is
  'Plan comercial contratado (starter, pro, enterprise...). Uso futuro para feature-gating.';

drop trigger if exists trg_tenants_set_updated_at on public.tenants;
create trigger trg_tenants_set_updated_at
  before update on public.tenants
  for each row
  execute function public.set_updated_at();

-- Contadores por tenant, usados por pedidos.numero_pedido y facturas.correlativo
create table public.tenant_contadores (
  tenant_id     bigint not null references public.tenants(id),
  tipo          text not null check (tipo in ('pedido', 'factura')),
  ultimo_numero integer not null default 0,
  primary key (tenant_id, tipo)
);

comment on table public.tenant_contadores is
  'Ultimo numero_pedido/correlativo de factura emitido por tenant. Se actualiza via public.siguiente_numero(), UPSERT atomico.';

create or replace function public.siguiente_numero(p_tenant_id bigint, p_tipo text)
returns integer
language plpgsql
as $$
declare
  v_numero integer;
begin
  insert into public.tenant_contadores (tenant_id, tipo, ultimo_numero)
  values (p_tenant_id, p_tipo, 1)
  on conflict (tenant_id, tipo)
  do update set ultimo_numero = public.tenant_contadores.ultimo_numero + 1
  returning ultimo_numero into v_numero;

  return v_numero;
end;
$$;

comment on function public.siguiente_numero(bigint, text) is
  'Devuelve el siguiente correlativo (pedido/factura) para un tenant de forma atomica (UPSERT, sin condicion de carrera).';
