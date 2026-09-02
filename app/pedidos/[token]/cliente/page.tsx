import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { getPortalData } from "@/lib/data/portal";
import { PedidoClienteForm } from "./pedido-cliente-form";

export const metadata = {
  title: "Hacer pedido",
};

export default async function PortalClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ pedido?: string }>;
}) {
  const { token } = await params;
  const { pedido } = await searchParams;

  const data = await getPortalData(token);
  if (!data) return notFound();

  const { cliente, productos } = data;

  if (pedido) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <CheckCircle2 className="size-14 text-green-600 dark:text-green-500" />
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-semibold text-foreground">
            ¡Pedido enviado!
          </h1>
          <p className="text-sm text-muted-foreground">
            Tu pedido <span className="font-medium text-foreground">#{pedido}</span>{" "}
            quedó registrado. {cliente.tenant_nombre} lo va a preparar.
          </p>
        </div>
        <a
          href={`/pedidos/${encodeURIComponent(token)}/cliente`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Hacer otro pedido
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md">
      <header className="border-b bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <BrandLogo />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">
              {cliente.tenant_nombre}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Pedido para {cliente.nombre_negocio}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4">
        <p className="py-3 text-xs text-muted-foreground">
          Elegí los productos y las cantidades. Al final revisás el total y
          enviás el pedido.
        </p>
        <PedidoClienteForm token={token} productos={productos} />
      </div>
    </main>
  );
}
