"use client";

import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLES } from "@/lib/validation/admin";
import { ROL_LABEL } from "@/lib/admin-labels";
import type { UsuarioRow } from "@/lib/data/admin";
import {
  EntityDialog,
  Field,
  SelectField,
  SwitchField,
} from "../_components/entity-dialog";
import { crearUsuario, actualizarUsuario } from "./actions";

const ROL_OPTS = ROLES.map((r) => ({ value: r, label: ROL_LABEL[r] }));

export function UsuarioDialog({ usuario }: { usuario?: UsuarioRow }) {
  const editar = !!usuario;
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
            Nuevo usuario
          </Button>
        )
      }
      title={editar ? "Editar usuario" : "Nuevo usuario"}
      action={editar ? actualizarUsuario : crearUsuario}
    >
      {(errors) => (
        <>
          {editar && <input type="hidden" name="id" value={usuario.id} />}
          <Field label="Nombre" name="nombre" errors={errors}>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={usuario?.nombre ?? ""}
              required
            />
          </Field>
          <SelectField
            name="rol"
            label="Rol"
            errors={errors}
            options={ROL_OPTS}
            defaultValue={usuario?.rol ?? "vendedor"}
          />
          <Field label="Teléfono" name="telefono" errors={errors}>
            <Input
              id="telefono"
              name="telefono"
              defaultValue={usuario?.telefono ?? ""}
            />
          </Field>
          <Field
            label="PIN"
            name="pin"
            errors={errors}
            hint="Solo aplica al rol operador de bodega."
          >
            <Input id="pin" name="pin" defaultValue={usuario?.pin ?? ""} />
          </Field>
          <SwitchField
            name="activo"
            label="Activo"
            defaultChecked={usuario?.activo ?? true}
          />
        </>
      )}
    </EntityDialog>
  );
}
