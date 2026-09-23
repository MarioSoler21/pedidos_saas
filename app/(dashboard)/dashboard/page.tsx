import {
  DollarSign,
  Receipt,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import { getSession } from "@/lib/session";
import { getPedidosReporte } from "@/lib/data/reportes";
import { listProductos } from "@/lib/data/admin";
import { FLUJO_ESTADOS, type EstadoPedido } from "@/lib/data/pedidos";
import { ESTADO_LABEL } from "@/components/estado-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formatoMoneda = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
});

const formatoDiaCorto = new Intl.DateTimeFormat("es-HN", {
  day: "2-digit",
  month: "short",
});

const ESTADOS_DASHBOARD: EstadoPedido[] = [...FLUJO_ESTADOS, "anulado"];

const ESTADO_BAR_CLASS: Record<EstadoPedido, string> = {
  pendiente: "bg-neutral-400",
  confirmado: "bg-blue-500",
  en_preparacion: "bg-amber-500",
  despachado: "bg-purple-500",
  entregado: "bg-green-500",
  anulado: "bg-red-500",
};

export default async function DashboardPage() {
  const tenant = await getSession();
  if (!tenant) return null;

  const [pedidos, productos] = await Promise.all([
    getPedidosReporte(tenant.id),
    listProductos(tenant.id),
  ]);

  const noAnulados = pedidos.filter((p) => p.estado !== "anulado");
  const ventasTotales = noAnulados.reduce((sum, p) => sum + p.total, 0);
  const ticketPromedio = noAnulados.length
    ? ventasTotales / noAnulados.length
    : 0;
  const clientesActivos = new Set(
    noAnulados.map((p) => p.cliente?.id).filter(Boolean),
  ).size;

  const porEstado = ESTADOS_DASHBOARD.map((estado) => ({
    estado,
    cantidad: pedidos.filter((p) => p.estado === estado).length,
  }));
  const maxPorEstado = Math.max(1, ...porEstado.map((e) => e.cantidad));

  const dias = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const ventasPorDia = dias.map((d) => {
    const total = noAnulados
      .filter(
        (p) => new Date(p.fecha_pedido).toDateString() === d.toDateString(),
      )
      .reduce((sum, p) => sum + p.total, 0);
    return { fecha: d, total };
  });
  const maxVentaDia = Math.max(1, ...ventasPorDia.map((d) => d.total));

  const clientesMap = new Map<
    number,
    { nombre: string; total: number; pedidos: number }
  >();
  for (const p of noAnulados) {
    if (!p.cliente) continue;
    const actual = clientesMap.get(p.cliente.id) ?? {
      nombre: p.cliente.nombre_negocio,
      total: 0,
      pedidos: 0,
    };
    actual.total += p.total;
    actual.pedidos += 1;
    clientesMap.set(p.cliente.id, actual);
  }
  const topClientes = [...clientesMap.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxCliente = Math.max(1, ...topClientes.map((c) => c.total));

  const productosMap = new Map<string, { cantidad: number }>();
  for (const p of noAnulados) {
    for (const item of p.items) {
      const nombre = item.producto?.nombre ?? "Producto eliminado";
      const actual = productosMap.get(nombre) ?? { cantidad: 0 };
      actual.cantidad += item.cantidad;
      productosMap.set(nombre, actual);
    }
  }
  const topProductos = [...productosMap.entries()]
    .map(([nombre, v]) => ({ nombre, ...v }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);
  const maxProducto = Math.max(1, ...topProductos.map((p) => p.cantidad));

  const stockBajo = productos.filter(
    (p) => p.activo && p.stock_actual <= p.stock_minimo,
  );

  const kpis = [
    {
      label: "Ventas totales",
      value: formatoMoneda.format(ventasTotales),
      icon: DollarSign,
    },
    {
      label: "Pedidos",
      value: pedidos.length.toLocaleString("es-HN"),
      icon: Receipt,
    },
    {
      label: "Ticket promedio",
      value: formatoMoneda.format(ticketPromedio),
      icon: TrendingUp,
    },
    {
      label: "Clientes activos",
      value: clientesActivos.toLocaleString("es-HN"),
      icon: Users,
    },
  ];

  return (
    <main className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Análisis de todos los pedidos de {tenant.nombreEmpresa}.
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Todavía no hay pedidos registrados para este tenant.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-3 py-1">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="truncate text-lg font-semibold tabular-nums text-foreground">
                      {value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle role="heading" aria-level={2}>
                  Ventas — últimos 14 días
                </CardTitle>
                <CardDescription>
                  Total facturado por día (no incluye anulados)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-end gap-1.5">
                  {ventasPorDia.map(({ fecha, total }) => (
                    <div
                      key={fecha.toISOString()}
                      className="group flex flex-1 flex-col items-center gap-1"
                    >
                      <div className="relative flex h-32 w-full items-end">
                        <div
                          className="w-full rounded-t-sm bg-primary/80 transition-colors group-hover:bg-primary"
                          style={{
                            height: `${Math.max(4, (total / maxVentaDia) * 100)}%`,
                          }}
                          title={formatoMoneda.format(total)}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatoDiaCorto.format(fecha)}
                        <span className="sr-only">
                          {" "}
                          — {formatoMoneda.format(total)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle role="heading" aria-level={2}>
                  Pedidos por estado
                </CardTitle>
                <CardDescription>Histórico completo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {porEstado.map(({ estado, cantidad }) => (
                  <div key={estado} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {ESTADO_LABEL[estado]}
                      </span>
                      <span className="font-medium tabular-nums text-foreground">
                        {cantidad}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${ESTADO_BAR_CLASS[estado]}`}
                        style={{
                          width: `${Math.max(cantidad ? 4 : 0, (cantidad / maxPorEstado) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle role="heading" aria-level={2}>
                  Top clientes
                </CardTitle>
                <CardDescription>Por total comprado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topClientes.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sin datos todavía.
                  </p>
                )}
                {topClientes.map((c) => (
                  <div key={c.nombre} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium text-foreground">
                        {c.nombre}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {formatoMoneda.format(c.total)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(c.total / maxCliente) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle role="heading" aria-level={2}>
                  Top productos
                </CardTitle>
                <CardDescription>Por unidades vendidas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topProductos.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sin datos todavía.
                  </p>
                )}
                {topProductos.map((p) => (
                  <div key={p.nombre} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium text-foreground">
                        {p.nombre}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {p.cantidad}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-secondary-foreground/70"
                        style={{ width: `${(p.cantidad / maxProducto) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle
                  role="heading"
                  aria-level={2}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="size-4 text-amber-500" aria-hidden />
                  Stock bajo
                </CardTitle>
                <CardDescription>Debajo del mínimo configurado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {stockBajo.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Todo el inventario está por encima del mínimo.
                  </p>
                )}
                {stockBajo.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate text-foreground">{p.nombre}</span>
                    <span className="shrink-0 tabular-nums text-amber-600 dark:text-amber-400">
                      {p.stock_actual} / {p.stock_minimo}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </main>
  );
}
