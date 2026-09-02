# Diprocar SaaS — Arquitectura multi-tenant

Proyecto nuevo desde cero: pedidos B2B para distribuidoras, diseñado desde el
día 1 para servir a varios tenants con el mismo código y el mismo esquema de
base de datos.

## 1. Por qué shared schema + RLS (y no schema-per-tenant o DB-per-tenant)

**Elegido: un solo esquema, columna `tenant_id` en cada tabla de negocio,
aislamiento por Row Level Security (RLS).**

| | Shared schema + RLS | Schema-per-tenant | DB-per-tenant |
|---|---|---|---|
| Migraciones | 1 vez, aplica a todos los tenants | N veces (una por schema) | N veces (una por DB) |
| Costo de infraestructura | Constante, no crece con clientes | Crece con clientes | Crece mucho con clientes |
| Onboarding de un tenant nuevo | 1 INSERT en `tenants` | Crear + migrar un schema nuevo | Provisionar una DB nueva |
| Aislamiento de datos | Policies de Postgres (RLS), a nivel de fila | A nivel de schema | Total (a nivel de DB) |
| Límite práctico en Supabase | Ninguno relevante | Postgres degrada con muchos miles de schemas (`pg_catalog`) | Cada DB es un proyecto Supabase aparte |

El criterio decisivo: "mismo código y mismo esquema sirviendo a varios
tenants sin duplicar infraestructura". Con shared schema + RLS:

- Una sola migración (`supabase db push`) actualiza a todos los tenants a la vez.
- Un tenant nuevo es una fila en `tenants`, no un deploy.
- El aislamiento vive en la base de datos, no en la disciplina del código de
  la app: aunque un desarrollador olvide un `WHERE tenant_id = ...`, Postgres
  igual filtra (y el trigger `trg_10_set_tenant_id` hace imposible insertar
  sin tenant).
- Es el patrón estándar recomendado por Supabase para SaaS B2B de este tamaño.

El costo que se paga a cambio: un bug en una policy de RLS puede filtrar
datos entre tenants. Por eso `force row level security` en todas las tablas
desde la migración `011`, y por eso el seed carga **dos tenants** con nombres
claramente distintos (`Distribuidora Uno` / `Ferretería El Sol`) — para poder
verificar a simple vista, desde el primer día, que uno nunca ve datos del otro.

## 2. Cómo se resuelve el `tenant_id` de un usuario

El JWT que emite Supabase Auth trae un claim personalizado en `app_metadata`:

```json
{ "app_metadata": { "tenant_id": "11111111-1111-1111-1111-111111111111" } }
```

`app_metadata` (a diferencia de `user_metadata`) **solo puede escribirlo el
backend** (con `service_role` o el Admin API), nunca el propio usuario desde
el cliente — por eso es el lugar seguro para guardar el `tenant_id`. La
función `public.current_tenant_id()` (migración `011`) lee ese claim con
`auth.jwt() -> 'app_metadata' ->> 'tenant_id'`, y todas las policies de RLS
comparan `tenant_id = public.current_tenant_id()`.

### Signup flow (alta de un usuario nuevo dentro de un tenant existente)

1. El Admin del tenant invita a un usuario (o el usuario hace signup con
   OTP/magic link/OAuth Microsoft).
2. Se crea el `auth.users` normalmente vía Supabase Auth.
3. Un **API route de servidor** (usando `service_role` vía
   `lib/supabase/admin.ts`, nunca desde el cliente) hace:
   ```ts
   await supabaseAdmin.auth.admin.updateUserById(authUserId, {
     app_metadata: { tenant_id: tenantIdDelAdminQueInvita },
   });
   ```
4. El mismo API route inserta la fila en `public.usuarios` con ese
   `auth_user_id`, `tenant_id` y `rol`.
5. En el siguiente refresh de sesión, el JWT del usuario ya trae
   `app_metadata.tenant_id`, y todas sus queries quedan automáticamente
   filtradas por RLS.

Sin el paso 3, el usuario tiene sesión válida pero `current_tenant_id()`
devuelve `null` y **no puede ver ni insertar nada** — es un fail-safe
deliberado, no un bug.

### Flujo de alta de un tenant nuevo (cliente nuevo del SaaS)

```sql
-- 1. Crear el tenant
insert into public.tenants (nombre_empresa, slug, plan)
values ('Distribuidora Nueva S.A.', 'distribuidora-nueva', 'starter')
returning id;

-- 2. Crear su primer usuario admin en Supabase Auth (Admin API o dashboard),
--    setear su app_metadata.tenant_id con el id de arriba (paso 3 del signup
--    flow) y crear su fila en public.usuarios con rol = 'admin'.

-- 3. Cargar datos base del tenant (zonas, categorías, catálogo, clientes),
--    todo con el nuevo tenant_id — normalmente vía CSV/import script.
```

No se requiere ninguna migración, deploy ni cambio de infraestructura: el
mismo código y el mismo esquema ya sirven al tenant nuevo apenas existe la
fila en `tenants` y el primer usuario tiene el claim correcto.

### Casos especiales sin JWT de usuario

- **`operador_bodega` (login por PIN):** no pasa por Supabase Auth.
  Recomendado: una API route valida el PIN contra `usuarios.pin` (hasheado) y
  emite un JWT propio con `app_metadata.tenant_id` (ej. `signInWithCustomToken`
  o un endpoint que use `service_role` para crear una sesión), para que el
  resto del flujo quede bajo RLS normal, sin lógica de aislamiento fuera de
  la base de datos.
- **Portal de cliente sin login (`/pedido/[token]`):** no hay usuario
  autenticado. La API route que resuelve el token usa `service_role`
  (bypassa RLS) y hace `select ... where token_unico = $1` — como
  `token_unico` es único **por tenant** (`unique(tenant_id, token_unico)`),
  el lookup se hace sin asumir el tenant y devuelve también el `tenant_id`
  encontrado, que se usa explícitamente en el resto de la request (nunca
  confiar en un tenant_id que venga del cliente).

## 3. numero_pedido y correlativo de factura, correlativos por tenant

Ambos se resuelven con `public.siguiente_numero(tenant_id, tipo)` (migración
`002`), un UPSERT atómico sobre `tenant_contadores` — evita la condición de
carrera de un `select max(...)+1` cuando dos vendedores del mismo tenant
crean pedidos al mismo tiempo. Los triggers `trg_20_set_numero_pedido`
(pedidos) y `trg_20_set_correlativo` (facturas) lo autocompletan si el INSERT
no lo especifica, y corren **después** de `trg_10_set_tenant_id` gracias al
orden alfabético de nombres de trigger en Postgres — necesitan `tenant_id`
ya resuelto para pedir el correlativo del tenant correcto.

## 4. Estructura de archivos

```
supabase/
  config.toml
  migrations/
    20260902100001_utility_functions.sql   -- trigger genérico set_updated_at()
    20260902100002_tenants.sql             -- tenants + tenant_contadores + siguiente_numero()
    20260902100003_usuarios.sql
    20260902100004_zonas.sql
    20260902100005_clientes.sql
    20260902100006_catalogo_productos.sql  -- categorias_producto + productos
    20260902100007_pedidos.sql             -- pedidos + pedido_items + pedido_historial + plantillas_pedido
    20260902100008_inventario.sql          -- movimientos_inventario
    20260902100009_facturacion.sql         -- facturas + detalle_factura + pagos
    20260902100010_indexes.sql
    20260902100011_current_tenant_id_and_rls.sql
    20260902100012_auto_tenant_id_trigger.sql
  seed.sql                                  -- DOS tenants completos de prueba

lib/supabase/
  client.ts     -- cliente browser (Client Components)
  server.ts     -- cliente server (Server Components / API routes)
  admin.ts      -- cliente service_role (bypassa RLS, solo server-side)
  middleware.ts -- refresco de sesión

app/
  page.tsx              -- landing con links a cada ruta
  providers.tsx          -- TanStack Query provider
  pedido/[token]/        -- Cliente, sin login
  home/                   -- Landing autenticada
  mis-clientes/           -- Vendedor
  despacho/               -- Despacho
  operador/               -- Operador de bodega (PIN)
  admin/                  -- Admin
  dashboard/              -- Métricas
  descargas/              -- Reportes/facturas PDF
```

Todas las rutas de `app/` son placeholders — el foco de esta entrega es el
proyecto base + la base de datos multi-tenant, no las pantallas completas.

## 5. Comandos para levantar el proyecto

**No se ejecutó nada contra Supabase remoto.** Comandos a correr:

```bash
# 1. Instalar dependencias (si no se corrió ya)
npm install

# 2. Levantar el proyecto Next.js localmente
npm run dev        # http://localhost:3000

# 3. Autenticar y linkear el CLI de Supabase al proyecto remoto
npx supabase login
npx supabase link --project-ref oinbkjlhvukccbozjcaq

# 4. (Recomendado) Probar las migraciones en un Postgres local con Docker
npx supabase start
npx supabase db reset     # aplica migraciones + seed.sql (2 tenants) localmente

# 5. Aplicar las migraciones al proyecto remoto — esto SÍ modifica producción
npx supabase db push

# 6. Verificar que quedaron registradas
npx supabase migration list
```

Antes del paso 5: confirma que quieres crear el esquema en el proyecto
remoto `oinbkjlhvukccbozjcaq` (es una base nueva, así que `db push` solo
crea tablas — no debería haber riesgo de pérdida de datos, pero igual
confírmalo antes de tocar el proyecto real).

### Pendiente para que el signup flow / PIN / token funcionen end-to-end

Agregar a `.env.local` (nunca con prefijo `NEXT_PUBLIC_`):

```
SUPABASE_SERVICE_ROLE_KEY=...   # Project Settings → API → service_role key
```

Necesaria para `lib/supabase/admin.ts` (setear `app_metadata.tenant_id` en
el signup flow, resolver `/pedido/[token]`, validar PIN de operador_bodega).
