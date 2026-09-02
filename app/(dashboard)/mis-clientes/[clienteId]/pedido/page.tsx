import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDevTenant } from "@/lib/dev-session";
import { getClientes, getProductos } from "@/lib/data/catalogo";
import { crearPedido } from "../../actions";

const formatoMoneda = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
});

export default async function NuevoPedidoPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const tenant = await getDevTenant();
  if (!tenant) return notFound();

  const [clientes, productos] = await Promise.all([
    getClientes(tenant.id),
    getProductos(tenant.id),
  ]);
  const cliente = clientes.find((c) => String(c.id) === clienteId);
  if (!cliente) return notFound();

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Nuevo pedido
        </h1>
        <p className="text-sm text-muted-foreground">
          Para{" "}
          <span className="font-medium text-foreground">
            {cliente.nombre_negocio}
          </span>{" "}
          · {tenant.nombreEmpresa}
        </p>
      </div>

      <form action={crearPedido} className="max-w-2xl">
        <input type="hidden" name="clienteId" value={cliente.id} />

        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {producto.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {producto.sku}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {formatoMoneda.format(producto.precio)}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {producto.stock_actual}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        name={`cantidad_${producto.id}`}
                        min={0}
                        max={producto.stock_actual}
                        defaultValue={0}
                        className="ml-auto w-20 text-right"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit">Crear pedido</Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}
