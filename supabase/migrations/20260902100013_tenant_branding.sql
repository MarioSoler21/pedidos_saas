-- =============================================================================
-- 013 - Branding por tenant (white-label)
-- =============================================================================
-- Cada tenant configura su marca desde /admin/configuracion: logo (subido a
-- Supabase Storage, bucket publico "branding"), textos y colores. Se aplica en
-- el shell del dashboard y en el portal de cliente (/pedidos/[token]/cliente).
-- Todo nullable: null = usar el default de la app / el tema base de shadcn.
-- =============================================================================

alter table public.tenants
  add column nombre_app       text,
  add column subtitulo_app    text,
  add column mensaje_portal   text,
  add column logo_url         text,
  add column color_primario   text,
  add column color_secundario text,
  add column color_sidebar    text;

comment on column public.tenants.nombre_app is
  'Wordmark de la app para este tenant (default: "Pedidos B2B").';
comment on column public.tenants.subtitulo_app is
  'Texto chico bajo el wordmark (default: "Distribuidoras").';
comment on column public.tenants.mensaje_portal is
  'Instrucciones que ve el cliente en el portal antes de armar el pedido.';
comment on column public.tenants.logo_url is
  'URL publica del logo en el bucket de Storage "branding".';
comment on column public.tenants.color_primario is
  'Hex #rrggbb inyectado como --primary. Null = tema base.';
comment on column public.tenants.color_secundario is
  'Hex #rrggbb inyectado como --secondary / --accent. Null = tema base.';
comment on column public.tenants.color_sidebar is
  'Hex #rrggbb inyectado como --sidebar (fondo del menu lateral). Null = tema base.';
