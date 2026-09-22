import { getSession } from "@/lib/session";
import { listCategorias } from "@/lib/data/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminTabs } from "../_components/admin-tabs";
import { ConfirmDelete } from "../_components/confirm-delete";
import { CategoriaDialog } from "./categoria-dialog";
import { eliminarCategoria } from "./actions";

export default async function CategoriasAdminPage() {
  const tenant = await getSession();
  const categorias = tenant ? await listCategorias(tenant.id) : [];

  return (
    <main className="p-6 lg:p-8">
      <AdminTabs />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Categorías de producto
          </h1>
          <p className="text-sm text-muted-foreground">
            {categorias.length} en {tenant?.nombreEmpresa}
          </p>
        </div>
        <CategoriaDialog />
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Sin categorías todavía.
                </TableCell>
              </TableRow>
            )}
            {categorias.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-foreground">
                  {c.nombre}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <CategoriaDialog categoria={c} />
                    <ConfirmDelete
                      id={c.id}
                      nombre={c.nombre}
                      action={eliminarCategoria}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
