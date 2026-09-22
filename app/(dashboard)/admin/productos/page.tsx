import { getSession } from "@/lib/session";
import {
  listProductos,
  listCategorias,
  type ProductoRow,
  type CategoriaRow,
} from "@/lib/data/admin";
import { money } from "@/lib/admin-labels";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminTabs } from "../_components/admin-tabs";
import { ActivoToggle } from "../_components/activo-toggle";
import { ProductoDialog } from "./producto-dialog";
import { setActivoProducto } from "./actions";

export default async function ProductosAdminPage() {
  const tenant = await getSession();
  const [productos, categorias]: [ProductoRow[], CategoriaRow[]] = tenant
    ? await Promise.all([listProductos(tenant.id), listCategorias(tenant.id)])
    : [[], []];

  const catNombre = new Map(categorias.map((c) => [c.id, c.nombre]));

  return (
    <main className="p-6 lg:p-8">
      <AdminTabs />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Productos
          </h1>
          <p className="text-sm text-muted-foreground">
            {productos.length} en {tenant?.nombreEmpresa}
          </p>
        </div>
        <ProductoDialog categorias={categorias} />
      </div>

      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="w-20">Activo</TableHead>
              <TableHead className="w-16 text-right">Editar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Sin productos todavía.
                </TableCell>
              </TableRow>
            )}
            {productos.map((p) => (
              <TableRow key={p.id} className={p.activo ? "" : "opacity-55"}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {p.sku}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {p.nombre}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.categoria_id ? (catNombre.get(p.categoria_id) ?? "—") : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money.format(p.precio)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {p.stock_actual}
                  {p.stock_actual <= p.stock_minimo && (
                    <span className="ml-1 text-destructive">•</span>
                  )}
                </TableCell>
                <TableCell>
                  <ActivoToggle
                    id={p.id}
                    activo={p.activo}
                    action={setActivoProducto}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <ProductoDialog producto={p} categorias={categorias} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        El stock se ajusta con movimientos de inventario, no se edita acá.
      </p>
    </main>
  );
}
