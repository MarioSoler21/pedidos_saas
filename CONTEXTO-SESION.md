# Contexto de sesión — Diprocar SaaS

Resumen de esta sesión de trabajo para retomarla después (con Claude o sin él).

## 1. Qué es el proyecto

SaaS de pedidos B2B para distribuidoras, inspirado en Diprocar (proyecto
anterior de un solo cliente), rediseñado desde cero como **multi-tenant**:
shared schema + `tenant_id` en cada tabla + Row Level Security.

Stack: Next.js 16 (App Router, TS), Tailwind, React Hook Form + Zod, TanStack
Query, Supabase (Postgres + Auth JWT por cookie), jsPDF + AutoTable.

Detalle de arquitectura completo en **`README-arquitectura.md`** (por qué
shared schema+RLS, cómo se resuelve `tenant_id` vía JWT, signup flow, alta de
tenant nuevo).

## 2. Qué está hecho

### Proyecto base
- Next.js 16.3.4 + TypeScript + Tailwind v4, scaffolded, compila y lintea limpio.
- `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `lib/supabase/`: `client.ts` (browser), `server.ts` (Server Components, cookies),
  `admin.ts` (service_role, bypassa RLS — **falta la key**, ver sección 3),
  `middleware.ts` (refresco de sesión).
- `proxy.ts` en la raíz (Next 16 renombró `middleware.ts` → `proxy.ts`; hecho a mano).

### Base de datos (supabase/migrations/, 12 archivos, ver README-arquitectura.md §4)
Esquema completo desde cero: `tenants`, `tenant_contadores` + `siguiente_numero()`
(correlativos atómicos por tenant), `usuarios`, `zonas`, `clientes`,
`categorias_producto`, `productos`, `pedidos`, `pedido_items`,
`pedido_historial`, `movimientos_inventario`, `plantillas_pedido`, `facturas`,
`detalle_factura`, `pagos`. RLS `FORCE` + policy `tenant_isolation` en todas.
Trigger `trg_10_set_tenant_id` (autocompleta tenant_id desde JWT) +
`trg_20_set_numero_pedido` / `trg_20_set_correlativo` (nombrados así a
propósito para el orden de disparo alfabético de Postgres).

**Todavía NO aplicado al proyecto remoto** (`oinbkjlhvukccbozjcaq`) — ver
bloqueo en sección 3.

### App — funcional con datos reales (una vez haya DB)
- **`lib/dev-session.ts`**: login demo **hardcodeado** (cookie `dev_tenant_id`,
  server-only). Reemplaza temporalmente el login real de Supabase Auth
  mientras no está cableado el signup flow completo. Tenants demo definidos
  ahí, deben coincidir con `supabase/seed.sql`:
  - `Distribuidora Uno` (`11111111-...-111111111111`) — etiqueta demo "Cliente X"
  - `Ferretería El Sol` (`22222222-...-222222222222`) — etiqueta demo "Cliente Y"
- **`/login`**: elegís con qué tenant "entrar" (botones), setea la cookie, redirige a `/despacho`.
- **`app/(dashboard)/`**: route group con shell compartido (`layout.tsx`):
  sidebar con nav + nombre del tenant activo + "Cambiar de tenant". Envuelve
  `home/`, `mis-clientes/`, `despacho/`, `admin/`, `dashboard/`, `descargas/`.
- **`/despacho`**: tabla real de pedidos (número, cliente, items, fecha,
  total, badge de estado) + botón que avanza el pedido al siguiente estado
  (`pendiente → confirmado → en_preparación → despachado → entregado`),
  registra en `pedido_historial`. Lee vía `lib/data/pedidos.ts`.
- **`/mis-clientes`**: lista real de clientes del tenant (`lib/data/catalogo.ts`)
  con botón "Nuevo pedido" → `/mis-clientes/[clienteId]/pedido`: formulario
  con el catálogo (precio, stock, cantidad) que crea `pedidos` + `pedido_items`
  de verdad (`app/(dashboard)/mis-clientes/actions.ts`).
- `admin`, `dashboard`, `descargas`, `operador`, `/pedido/[token]`: siguen como
  placeholders (no tocados en esta sesión).

**Importante**: como todavía no hay JWT real con `app_metadata.tenant_id`,
todas estas páginas leen/escriben usando el cliente **admin (service_role)**,
filtrando explícitamente por el `tenant_id` de la cookie dev — nunca confían
en tenant_id que venga del formulario. Está marcado con TODOs para
reemplazar por RLS real cuando se cablee el login de Supabase Auth.

### Seed (`supabase/seed.sql`)
Dos tenants completos (admin, zonas, categorías, productos, clientes) +
3 pedidos de ejemplo en distintos estados para el tenant "Distribuidora Uno"
(pendiente, confirmado, en_preparación) — así el panel de despacho no se ve
vacío apenas hay datos.

## 3. Bloqueado — necesita acción tuya

No hay Docker, así que no se puede correr Supabase local (`supabase start` /
`db reset`). El plan es aplicar todo directo contra el proyecto remoto
`oinbkjlhvukccbozjcaq`. Para eso faltan **dos credenciales**:

1. **Access token de Supabase CLI** (para `supabase login` / `link` / `db push`).
   El login automático con browser no funciona en este entorno (no-TTY).
   Camino más simple: generás un token en
   https://supabase.com/dashboard/account/tokens ("Generate new token") y me
   lo pegás — lo uso solo para `supabase login --token ...` local.
   - Intenté usar la extensión de Chrome para hacerlo yo mismo, pero no está
     conectada en este entorno (necesita estar instalada y logueada en Chrome
     con la cuenta de claude.ai `relay2@heritagehill.com`).

2. **`service_role` key** del proyecto (Project Settings → API → service_role
   key) — para que `lib/supabase/admin.ts` funcione (las páginas de
   despacho/mis-clientes ya están escritas para usarla). Se agrega a
   `.env.local` como `SUPABASE_SERVICE_ROLE_KEY` (nunca con prefijo
   `NEXT_PUBLIC_`).

## 4. Próximos pasos, en orden, una vez tenga las credenciales

```bash
npx supabase login --token <TOKEN>
npx supabase link --project-ref oinbkjlhvukccbozjcaq
npx supabase db push               # aplica las 12 migraciones al remoto
```

Después del push, como no hay Docker para `db reset` (que aplicaría el
seed automáticamente), voy a correr un script chiquito con `@supabase/supabase-js`
+ la `service_role` key que inserta el mismo contenido de `supabase/seed.sql`
directo contra el proyecto remoto vía API (no necesita password de Postgres).

Con eso: `npm run dev`, entrar a `/login`, elegir "Distribuidora Uno", y
`/despacho` debería mostrar los 3 pedidos de ejemplo con datos reales.

## 5. Decisiones/convenciones a recordar

- Shared schema + RLS (no schema-per-tenant/DB-per-tenant) — ver justificación
  completa en README-arquitectura.md §1.
- `tenant_id` se resuelve del JWT vía `app_metadata.tenant_id` — nunca de
  `user_metadata` (el usuario no puede escribirlo).
- `numero_pedido` / `correlativo` de factura: correlativos **por tenant**,
  resueltos con `public.siguiente_numero()` (UPSERT atómico), no con
  `select max(...)+1`.
- Nada se borra físicamente: pedidos/facturas se anulan (estado), nunca DELETE.
- El login demo hardcodeado (`lib/dev-session.ts`) es temporal — reemplazar
  por Supabase Auth real + JWT con `app_metadata.tenant_id` antes de producción.
