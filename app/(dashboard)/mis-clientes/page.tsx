import Link from "next/link";
import { Phone, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDevTenant } from "@/lib/dev-session";
import { getClientes } from "@/lib/data/catalogo";

export default async function MisClientesPage() {
  const tenant = await getDevTenant();
  const clientes = tenant ? await getClientes(tenant.id) : [];

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Mis clientes
        </h1>
        <p className="text-sm text-muted-foreground">
          Cartera de {tenant?.nombreEmpresa}. Elegí un cliente para hacerle un
          pedido.
        </p>
      </div>

      {clientes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Este tenant todavía no tiene clientes.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="justify-between">
              <CardHeader>
                <CardTitle>{cliente.nombre_negocio}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                {cliente.nombre_contacto && (
                  <p className="flex items-center gap-2">
                    <User className="size-3.5 shrink-0" aria-hidden />
                    {cliente.nombre_contacto}
                  </p>
                )}
                {cliente.telefono && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0" aria-hidden />
                    {cliente.telefono}
                  </p>
                )}
              </CardContent>
              <CardContent>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/mis-clientes/${cliente.id}/pedido`}>
                    Nuevo pedido
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
