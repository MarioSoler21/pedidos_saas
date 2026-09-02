"use client";

import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoriaRow } from "@/lib/data/admin";
import { EntityDialog, Field } from "../_components/entity-dialog";
import { crearCategoria, actualizarCategoria } from "./actions";

export function CategoriaDialog({ categoria }: { categoria?: CategoriaRow }) {
  const editar = !!categoria;
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
            Nueva categoría
          </Button>
        )
      }
      title={editar ? "Editar categoría" : "Nueva categoría"}
      action={editar ? actualizarCategoria : crearCategoria}
    >
      {(errors) => (
        <>
          {editar && <input type="hidden" name="id" value={categoria.id} />}
          <Field label="Nombre" name="nombre" errors={errors}>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={categoria?.nombre ?? ""}
              required
            />
          </Field>
        </>
      )}
    </EntityDialog>
  );
}
