-- =============================================================================
-- 006 - categorias_producto y productos (catalogo)
-- =============================================================================

create table public.categorias_producto (
  id          bigint generated always as identity primary key,
  tenant_id   bigint not null references public.tenants(id),
  nombre      text not null,
  created_at  timestamptz not null default now()
);

comment on table public.categorias_producto is
  'Categorias del catalogo de productos, propias de cada tenant.';

create table public.productos (
  id            bigint generated always as identity primary key,
  tenant_id     bigint not null references public.tenants(id),
  sku           text not null,
  nombre        text not null,
  categoria_id  bigint references public.categorias_producto(id),
  unidad_medida text not null default 'unidad',
  precio        numeric(12, 2) not null default 0,
  costo         numeric(12, 2) not null default 0,
  stock_actual  numeric(12, 2) not null default 0,
  stock_minimo  numeric(12, 2) not null default 0,
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint productos_tenant_sku_key unique (tenant_id, sku)
);

comment on table public.productos is
  'Catalogo de productos por tenant. stock_actual se mantiene via movimientos_inventario, no se edita directo desde la app.';

drop trigger if exists trg_productos_set_updated_at on public.productos;
create trigger trg_productos_set_updated_at
  before update on public.productos
  for each row
  execute function public.set_updated_at();
