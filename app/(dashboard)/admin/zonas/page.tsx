import { getDevTenant } from "@/lib/dev-session";
import { listZonas } from "@/lib/data/admin";
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
import { ConfirmDelete } from "../_components/confirm-delete";
import { ZonaDialog } from "./zona-dialog";
import { setActivoZona, eliminarZona } from "./actions";

export default async function ZonasAdminPage() {
  const tenant = await getDevTenant();
  const zonas = tenant ? await listZonas(tenant.id) : [];

  return (
    <main className="p-6 lg:p-8">
      <AdminTabs />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Zonas
          </h1>
          <p className="text-sm text-muted-foreground">
            {zonas.length} en {tenant?.nombreEmpresa}
          </p>
        </div>
        <ZonaDialog />
      </div>

      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Orden</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-20">Activa</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zonas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Sin zonas todavía.
                </TableCell>
              </TableRow>
            )}
            {zonas.map((z) => (
              <TableRow key={z.id} className={z.activa ? "" : "opacity-55"}>
                <TableCell className="tabular-nums text-muted-foreground">
                  {z.orden}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {z.nombre}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {z.descripcion ?? "—"}
                </TableCell>
                <TableCell>
                  <ActivoToggle
                    id={z.id}
                    activo={z.activa}
                    action={setActivoZona}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <ZonaDialog zona={z} />
                    <ConfirmDelete
                      id={z.id}
                      nombre={z.nombre}
                      action={eliminarZona}
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
