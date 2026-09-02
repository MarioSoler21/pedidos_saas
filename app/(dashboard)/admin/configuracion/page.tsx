import { getDevTenant } from "@/lib/dev-session";
import { getTenant } from "@/lib/data/admin";
import { toBranding } from "@/lib/branding";
import { AdminTabs } from "../_components/admin-tabs";
import { ConfigForm } from "./config-form";
import { LogoUploader } from "./logo-uploader";

export default async function ConfiguracionAdminPage() {
  const tenant = await getDevTenant();
  const row = tenant ? await getTenant(tenant.id) : null;
  const branding = toBranding(row);

  return (
    <main className="p-6 lg:p-8">
      <AdminTabs />
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Configuración del tenant
        </h1>
        <p className="text-sm text-muted-foreground">
          Datos y marca de {branding.nombreEmpresa || tenant?.nombreEmpresa}.
        </p>
      </div>

      {row ? (
        <div className="space-y-6">
          <div className="max-w-xl rounded-xl p-4 ring-1 ring-foreground/10">
            <p className="mb-3 text-sm font-semibold text-foreground">Logo</p>
            <LogoUploader
              logoUrl={branding.logoUrl}
              nombreApp={branding.nombreApp}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              PNG, JPG, WEBP o SVG. Hasta 2 MB.
            </p>
          </div>
          <ConfigForm tenant={row} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No se pudo cargar la configuración.
        </p>
      )}
    </main>
  );
}
