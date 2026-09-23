import { getSession } from "@/lib/session";
import { getPedidosReporte } from "@/lib/data/reportes";
import { DescargasClient } from "./descargas-client";

export default async function DescargasPage() {
  const tenant = await getSession();
  const pedidos = tenant ? await getPedidosReporte(tenant.id) : [];

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Descargas
        </h1>
        <p className="text-sm text-muted-foreground">
          Reporte de todos los pedidos de {tenant?.nombreEmpresa}: exportá a
          PDF o CSV.
        </p>
      </div>

      <DescargasClient
        pedidos={pedidos}
        nombreEmpresa={tenant?.nombreEmpresa ?? "reporte"}
      />
    </main>
  );
}
