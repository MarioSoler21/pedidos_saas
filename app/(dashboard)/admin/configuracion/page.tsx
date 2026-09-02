import { getDevTenant } from "@/lib/dev-session";
import { getTenant } from "@/lib/data/admin";
import { AdminTabs } from "../_components/admin-tabs";
import { ConfigForm } from "./config-form";

export default async function ConfiguracionAdminPage() {
  const tenant = await getDevTenant();
  const row = tenant ? await getTenant(tenant.id) : null;

  return (
    <main className="p-6 lg:p-8">
      <AdminTabs />
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Configuración del tenant
        </h1>
        <p className="text-sm text-muted-foreground">
          Datos de {tenant?.nombreEmpresa}.
        </p>
      </div>

      {row ? (
        <ConfigForm tenant={row} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No se pudo cargar la configuración.
        </p>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Nota: el nombre que aparece en el menú lateral viene del login demo
        (`lib/dev-session.ts`), no de la base — hasta que se cablee Supabase Auth
        real.
      </p>
    </main>
  );
}
