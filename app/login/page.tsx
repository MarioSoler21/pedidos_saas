import Image from "next/image";
import { redirect } from "next/navigation";

import appLogo from "@/app/icon.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/session";
import { BRANDING_DEFAULTS } from "@/lib/branding";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/despacho");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src={appLogo}
            alt=""
            priority
            className="size-16 rounded-2xl shadow-sm ring-1 ring-foreground/10"
          />
          <div>
            <h1 className="font-heading text-lg font-semibold text-foreground">
              {BRANDING_DEFAULTS.nombreApp}
            </h1>
            <p className="text-sm text-muted-foreground">
              {BRANDING_DEFAULTS.subtituloApp}
            </p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
