"use client";

import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ZonaRow } from "@/lib/data/admin";
import {
  EntityDialog,
  Field,
  SwitchField,
} from "../_components/entity-dialog";
import { crearZona, actualizarZona } from "./actions";

export function ZonaDialog({ zona }: { zona?: ZonaRow }) {
  const editar = !!zona;
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
            Nueva zona
          </Button>
        )
      }
      title={editar ? "Editar zona" : "Nueva zona"}
      action={editar ? actualizarZona : crearZona}
    >
      {(errors) => (
        <>
          {editar && <input type="hidden" name="id" value={zona.id} />}
          <Field label="Nombre" name="nombre" errors={errors}>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={zona?.nombre ?? ""}
              required
            />
          </Field>
          <Field label="Descripción" name="descripcion" errors={errors}>
            <Input
              id="descripcion"
              name="descripcion"
              defaultValue={zona?.descripcion ?? ""}
            />
          </Field>
          <Field
            label="Orden"
            name="orden"
            errors={errors}
            hint="Para ordenar la lista de zonas."
          >
            <Input
              id="orden"
              name="orden"
              type="number"
              step="1"
              defaultValue={zona?.orden ?? 0}
            />
          </Field>
          <SwitchField
            name="activa"
            label="Activa"
            defaultChecked={zona?.activa ?? true}
          />
        </>
      )}
    </EntityDialog>
  );
}
