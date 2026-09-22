import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/session";
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
        <div className="flex justify-center">
          <BrandLogo withWordmark />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
