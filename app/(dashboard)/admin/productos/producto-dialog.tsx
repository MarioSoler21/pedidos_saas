"use client";

import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UNIDADES } from "@/lib/validation/admin";
import { UNIDAD_LABEL } from "@/lib/admin-labels";
import type { ProductoRow } from "@/lib/data/admin";
import {
  EntityDialog,
  Field,
  SelectField,
  SwitchField,
} from "../_components/entity-dialog";
import { crearProducto, actualizarProducto } from "./actions";

type CatOpt = { id: number; nombre: string };

const UNIDAD_OPTS = UNIDADES.map((u) => ({ value: u, label: UNIDAD_LABEL[u] }));

export function ProductoDialog({
  producto,
  categorias,
}: {
  producto?: ProductoRow;
  categorias: CatOpt[];
}) {
  const editar = !!producto;
  const catOpts = categorias.map((c) => ({
    value: String(c.id),
    label: c.nombre,
  }));

  return (
    <EntityDialog
      trigger={
        editar ? (
          <Button variant="ghost" size="icon-sm" aria-label="Editar">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        )
      }
      title={editar ? "Editar producto" : "Nuevo producto"}
      action={editar ? actualizarProducto : crearProducto}
    >
      {(errors) => (
        <>
          {editar && <input type="hidden" name="id" value={producto.id} />}
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <Field label="SKU" name="sku" errors={errors}>
              <Input
                id="sku"
                name="sku"
                defaultValue={producto?.sku ?? ""}
                required
              />
            </Field>
            <Field label="Nombre" name="nombre" errors={errors}>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={producto?.nombre ?? ""}
                required
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              name="categoria_id"
              label="Categoría"
              errors={errors}
              options={catOpts}
              defaultValue={
                producto?.categoria_id ? String(producto.categoria_id) : ""
              }
              includeNone
              noneLabel="Sin categoría"
            />
            <SelectField
              name="unidad_medida"
              label="Unidad"
              errors={errors}
              options={UNIDAD_OPTS}
              defaultValue={producto?.unidad_medida ?? "unidad"}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Precio" name="precio" errors={errors}>
              <Input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                min={0}
                defaultValue={producto?.precio ?? 0}
              />
            </Field>
            <Field label="Costo" name="costo" errors={errors}>
              <Input
                id="costo"
                name="costo"
                type="number"
                step="0.01"
                min={0}
                defaultValue={producto?.costo ?? 0}
              />
            </Field>
            <Field label="Stock mín." name="stock_minimo" errors={errors}>
              <Input
                id="stock_minimo"
                name="stock_minimo"
                type="number"
                step="0.01"
                min={0}
                defaultValue={producto?.stock_minimo ?? 0}
              />
            </Field>
          </div>
          <SwitchField
            name="activo"
            label="Activo"
            defaultChecked={producto?.activo ?? true}
          />
        </>
      )}
    </EntityDialog>
  );
}
