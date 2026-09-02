import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { DashboardNav } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getDevTenant } from "@/lib/dev-session";
import { salirDelTenant } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getDevTenant();

  if (!tenant) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="flex w-60 shrink-0 flex-col justify-between border-r bg-sidebar p-4 text-sidebar-foreground">
        <div>
          <div className="px-1 py-1">
            <BrandLogo withWordmark />
          </div>
          <Separator className="my-4" />
          <DashboardNav />
        </div>

        <div className="space-y-2">
          <Separator />
          <div className="px-2">
            <p className="text-xs font-medium text-foreground">
              {tenant.nombreEmpresa}
            </p>
            <p className="text-xs text-muted-foreground">{tenant.etiquetaDemo}</p>
          </div>
          <form action={salirDelTenant}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
            >
              Cambiar de tenant
            </Button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
