import { ChevronRight } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_TENANTS } from "@/lib/dev-session";
import { entrarComoTenant } from "./actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <BrandLogo withWordmark />
        </div>

        <Card>
          <CardHeader>
            <p className="text-xs font-medium tracking-wide text-amber-600 uppercase dark:text-amber-500">
              Login demo (hardcodeado)
            </p>
            <CardTitle>Elegí con qué tenant entrar</CardTitle>
            <CardDescription>
              Reemplaza temporalmente el login real (OTP / magic link / OAuth)
              mientras se termina de cablear Supabase Auth.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-2">
            {DEMO_TENANTS.map((tenant) => (
              <form key={tenant.id} action={entrarComoTenant}>
                <input type="hidden" name="tenantId" value={tenant.id} />
                <Button
                  type="submit"
                  variant="outline"
                  className="h-auto w-full justify-between px-4 py-3"
                >
                  <span className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {tenant.nombreEmpresa}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {tenant.etiquetaDemo} · {tenant.slug}
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Button>
              </form>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
