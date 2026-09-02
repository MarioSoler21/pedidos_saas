-- =============================================================================
-- 004 - zonas
-- =============================================================================

create table public.zonas (
  id          bigint generated always as identity primary key,
  tenant_id   bigint not null references public.tenants(id),
  nombre      text not null,
  descripcion text,
  orden       integer not null default 0,
  activa      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.zonas is
  'Zonas geograficas de reparto/venta, propias de cada tenant.';

drop trigger if exists trg_zonas_set_updated_at on public.zonas;
create trigger trg_zonas_set_updated_at
  before update on public.zonas
  for each row
  execute function public.set_updated_at();
