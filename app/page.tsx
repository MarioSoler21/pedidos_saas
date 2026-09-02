import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <BrandLogo />
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Pedidos B2B
        </h1>
        <p className="text-sm text-muted-foreground">
          Pedidos B2B multi-tenant para distribuidoras.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/login">Entrar</Link>
      </Button>
    </main>
  );
}
