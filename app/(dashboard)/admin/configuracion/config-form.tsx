"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { PLANES } from "@/lib/validation/admin";
import { PLAN_LABEL } from "@/lib/admin-labels";
import type { TenantRow } from "@/lib/data/admin";
import type { FormState } from "@/lib/validation/admin";
import { Field, SelectField } from "../_components/entity-dialog";
import { SubmitButton } from "../_components/submit-button";
import { actualizarConfiguracion } from "./actions";

const initial: FormState = { ok: false };
const PLAN_OPTS = PLANES.map((p) => ({ value: p, label: PLAN_LABEL[p] }));

export function ConfigForm({ tenant }: { tenant: TenantRow }) {
  const [state, formAction] = useActionState(actualizarConfiguracion, initial);

  useEffect(() => {
    if (state.ok) toast.success("Configuración guardada.");
    else if (state.error && !state.fieldErrors) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <Field
        label="Nombre de la empresa"
        name="nombre_empresa"
        errors={state.fieldErrors}
      >
        <Input
          id="nombre_empresa"
          name="nombre_empresa"
          defaultValue={tenant.nombre_empresa}
          required
        />
      </Field>
      <Field
        label="Slug"
        name="slug"
        errors={state.fieldErrors}
        hint="Identificador corto para URLs/subdominios. Solo minúsculas, números y guiones."
      >
        <Input id="slug" name="slug" defaultValue={tenant.slug} required />
      </Field>
      <SelectField
        name="plan"
        label="Plan"
        errors={state.fieldErrors}
        options={PLAN_OPTS}
        defaultValue={tenant.plan}
      />
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
