import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { DashboardNav } from "@/components/dashboard-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/session";
import { getTenantBranding } from "@/lib/data/admin";
import { brandingStyle } from "@/lib/branding";
import { ROL_LABEL } from "@/lib/admin-labels";
import { salirDelTenant, cambiarNegocio } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getSession();

  if (!tenant) {
    redirect("/login");
  }

  const branding = await getTenantBranding(tenant.id);

  return (
    <div
      className="flex min-h-screen bg-muted/40"
      style={brandingStyle(branding)}
    >
      <aside className="flex w-60 shrink-0 flex-col justify-between border-r bg-sidebar p-4 text-sidebar-foreground">
        <div>
          <div className="flex items-center justify-between px-1 py-1">
            <BrandLogo
              withWordmark
              logoUrl={branding.logoUrl}
              nombre={branding.nombreApp}
              subtitulo={branding.subtituloApp}
            />
            <ThemeToggle />
          </div>
          <Separator className="my-4" />
          <DashboardNav />
        </div>

        <div className="space-y-2">
          <Separator />
          <div className="px-2">
            <p className="text-xs font-medium text-foreground">
              {branding.nombreEmpresa || tenant.nombreEmpresa}
            </p>
            <p className="text-xs text-muted-foreground">
              {tenant.email} · {ROL_LABEL[tenant.rol] ?? tenant.rol}
            </p>
          </div>
          {tenant.negocios.length > 1 && (
            <div className="space-y-1">
              {tenant.negocios.map((negocio) => (
                <form key={negocio.tenantId} action={cambiarNegocio}>
                  <input type="hidden" name="tenantId" value={negocio.tenantId} />
                  <Button
                    type="submit"
                    variant={negocio.tenantId === tenant.id ? "secondary" : "ghost"}
                    size="sm"
                    disabled={negocio.tenantId === tenant.id}
                    className="w-full justify-start"
                  >
                    {negocio.nombreEmpresa}
                  </Button>
                </form>
              ))}
            </div>
          )}
          <form action={salirDelTenant}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
            >
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
