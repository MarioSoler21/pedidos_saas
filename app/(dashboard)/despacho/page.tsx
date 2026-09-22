import { getSession } from "@/lib/session";
import {
  getPedidosParaDespacho,
  siguienteEstado,
  type EstadoPedido,
} from "@/lib/data/pedidos";
import { EstadoBadge, ESTADO_LABEL } from "@/components/estado-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { avanzarEstadoPedido } from "./actions";

const ACCION_LABEL: Partial<Record<EstadoPedido, string>> = {
  pendiente: "Confirmar",
  confirmado: "Enviar a preparación",
  en_preparacion: "Marcar despachado",
  despachado: "Marcar entregado",
};

const ESTADOS_ACTIVOS = [
  "pendiente",
  "confirmado",
  "en_preparacion",
  "despachado",
] as const;

const formatoMoneda = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
});

const formatoFecha = new Intl.DateTimeFormat("es-HN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function DespachoPage() {
  const tenant = await getSession();
  const pedidos = tenant ? await getPedidosParaDespacho(tenant.id) : [];

  const porEstado = pedidos.reduce<Record<string, number>>((acc, p) => {
    acc[p.estado] = (acc[p.estado] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Despacho
          </h1>
          <p className="text-sm text-muted-foreground">
            Pedidos de {tenant?.nombreEmpresa} listos para preparar, despachar o
            entregar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ESTADOS_ACTIVOS.map((estado) => (
            <div
              key={estado}
              className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 text-xs ring-1 ring-foreground/10"
            >
              <span className="text-muted-foreground">
                {ESTADO_LABEL[estado]}
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {porEstado[estado] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No hay pedidos activos para este tenant todavía. Creá uno desde{" "}
          <span className="font-medium text-foreground">Mis clientes</span>.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pedidos.map((pedido) => {
            const accion = ACCION_LABEL[pedido.estado as EstadoPedido];
            const puedeAvanzar = siguienteEstado(pedido.estado) !== null;

            return (
              <Card key={pedido.id} className="justify-between">
                <CardHeader>
                  <CardTitle className="tabular-nums">
                    Pedido #{pedido.numero_pedido}
                  </CardTitle>
                  <CardAction>
                    <EstadoBadge estado={pedido.estado} />
                  </CardAction>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-medium text-foreground">
                      {pedido.cliente?.nombre_negocio ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Items</p>
                    <ul className="mt-0.5 space-y-0.5 text-sm text-foreground">
                      {pedido.items.map((i, idx) => (
                        <li key={idx}>
                          <span className="tabular-nums text-muted-foreground">
                            {i.cantidad}×
                          </span>{" "}
                          {i.producto?.nombre ?? "?"}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatoFecha.format(new Date(pedido.fecha_pedido))}
                  </p>
                </CardContent>

                <CardFooter className="justify-between">
                  <span className="text-base font-semibold tabular-nums text-foreground">
                    {formatoMoneda.format(pedido.total)}
                  </span>
                  {puedeAvanzar && accion && (
                    <form action={avanzarEstadoPedido}>
                      <input type="hidden" name="pedidoId" value={pedido.id} />
                      <input
                        type="hidden"
                        name="estadoActual"
                        value={pedido.estado}
                      />
                      <Button type="submit" size="sm">
                        {accion}
                      </Button>
                    </form>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
