"use client";

import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TIPOS_CLIENTE } from "@/lib/validation/admin";
import { TIPO_CLIENTE_LABEL } from "@/lib/admin-labels";
import type { ClienteRow } from "@/lib/data/admin";
import {
  EntityDialog,
  Field,
  SelectField,
  SwitchField,
} from "../_components/entity-dialog";
import { crearCliente, actualizarCliente } from "./actions";

type ZonaOpt = { id: number; nombre: string };

const TIPO_OPTS = TIPOS_CLIENTE.map((t) => ({
  value: t,
  label: TIPO_CLIENTE_LABEL[t],
}));

export function ClienteDialog({
  cliente,
  zonas,
}: {
  cliente?: ClienteRow;
  zonas: ZonaOpt[];
}) {
  const editar = !!cliente;
  const zonaOpts = zonas.map((z) => ({ value: String(z.id), label: z.nombre }));

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
            Nuevo cliente
          </Button>
        )
      }
      title={editar ? "Editar cliente" : "Nuevo cliente"}
      action={editar ? actualizarCliente : crearCliente}
    >
      {(errors) => (
        <>
          {editar && <input type="hidden" name="id" value={cliente.id} />}
          <Field label="Nombre del negocio" name="nombre_negocio" errors={errors}>
            <Input
              id="nombre_negocio"
              name="nombre_negocio"
              defaultValue={cliente?.nombre_negocio ?? ""}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contacto" name="nombre_contacto" errors={errors}>
              <Input
                id="nombre_contacto"
                name="nombre_contacto"
                defaultValue={cliente?.nombre_contacto ?? ""}
              />
            </Field>
            <Field label="Teléfono" name="telefono" errors={errors}>
              <Input
                id="telefono"
                name="telefono"
                defaultValue={cliente?.telefono ?? ""}
              />
            </Field>
          </div>
          <Field label="Dirección" name="direccion" errors={errors}>
            <Input
              id="direccion"
              name="direccion"
              defaultValue={cliente?.direccion ?? ""}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              name="zona_id"
              label="Zona"
              errors={errors}
              options={zonaOpts}
              defaultValue={cliente?.zona_id ? String(cliente.zona_id) : ""}
              includeNone
              noneLabel="Sin zona"
            />
            <SelectField
              name="tipo_cliente"
              label="Tipo"
              errors={errors}
              options={TIPO_OPTS}
              defaultValue={cliente?.tipo_cliente ?? ""}
              includeNone
            />
          </div>
          <Field label="Notas" name="notas" errors={errors}>
            <Textarea
              id="notas"
              name="notas"
              rows={2}
              defaultValue={cliente?.notas ?? ""}
            />
          </Field>
          <SwitchField
            name="activo"
            label="Activo"
            defaultChecked={cliente?.activo ?? true}
          />
        </>
      )}
    </EntityDialog>
  );
}
