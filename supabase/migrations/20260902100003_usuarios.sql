-- =============================================================================
-- 003 - usuarios
-- =============================================================================
-- Un usuario por persona-en-un-tenant (admin, vendedor, despacho, cliente_portal
-- se vinculan a auth.users; operador_bodega entra por PIN y auth_user_id queda
-- null).
--
-- id/tenant_id son bigint. auth_user_id sigue siendo uuid: referencia
-- auth.users(id) de Supabase.
-- =============================================================================

create table public.usuarios (
  id            bigint generated always as identity primary key,
  tenant_id     bigint not null references public.tenants(id),
  auth_user_id  uuid references auth.users(id) on delete set null,
  nombre        text not null,
  rol           text not null check (rol in ('admin', 'vendedor', 'despacho', 'operador_bodega', 'cliente_portal')),
  telefono      text,
  pin           text,
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.usuarios is
  'Usuarios de la app por tenant. Un mismo auth.users puede en teoria pertenecer a distintos tenants con filas usuarios distintas.';
comment on column public.usuarios.auth_user_id is
  'Referencia a auth.users cuando el usuario inicia sesion con Supabase Auth (OTP/magic link/OAuth). Null para operador_bodega.';
comment on column public.usuarios.pin is
  'PIN hasheado (ej. bcrypt) usado por operador_bodega para iniciar sesion sin auth.users.';

-- Un mismo auth_user_id no deberia repetirse dos veces DENTRO del mismo tenant
create unique index idx_usuarios_tenant_auth_user
  on public.usuarios (tenant_id, auth_user_id)
  where auth_user_id is not null;

drop trigger if exists trg_usuarios_set_updated_at on public.usuarios;
create trigger trg_usuarios_set_updated_at
  before update on public.usuarios
  for each row
  execute function public.set_updated_at();
