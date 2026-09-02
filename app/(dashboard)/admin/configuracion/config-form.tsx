"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PLANES } from "@/lib/validation/admin";
import { PLAN_LABEL } from "@/lib/admin-labels";
import { toBranding } from "@/lib/branding";
import type { TenantRow } from "@/lib/data/admin";
import type { FormState } from "@/lib/validation/admin";
import { Field, SelectField } from "../_components/entity-dialog";
import { SubmitButton } from "../_components/submit-button";
import { BrandingSection } from "./branding-colors";
import { actualizarConfiguracion } from "./actions";

const initial: FormState = { ok: false };
const PLAN_OPTS = PLANES.map((p) => ({ value: p, label: PLAN_LABEL[p] }));

export function ConfigForm({ tenant }: { tenant: TenantRow }) {
  const [state, formAction] = useActionState(actualizarConfiguracion, initial);
  const branding = toBranding(tenant);

  useEffect(() => {
    if (state.ok) toast.success("Configuración guardada.");
    else if (state.error && !state.fieldErrors) toast.error(state.error);
  }, [state]);

  const errs = state.fieldErrors;

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Datos</h2>
        <Field label="Nombre de la empresa" name="nombre_empresa" errors={errs}>
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
          errors={errs}
          hint="Identificador corto para URLs/subdominios. Solo minúsculas, números y guiones."
        >
          <Input id="slug" name="slug" defaultValue={tenant.slug} required />
        </Field>
        <SelectField
          name="plan"
          label="Plan"
          errors={errs}
          options={PLAN_OPTS}
          defaultValue={tenant.plan}
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Marca</h2>
          <p className="text-xs text-muted-foreground">
            Se aplica al menú lateral y al portal de cliente.
          </p>
        </div>
        <BrandingSection
          errors={errs}
          nombreApp={tenant.nombre_app}
          subtituloApp={tenant.subtitulo_app}
          primario={branding.colorPrimario}
          secundario={branding.colorSecundario}
          sidebar={branding.colorSidebar}
          logoUrl={branding.logoUrl}
        />

        <Field
          label="Mensaje del portal de cliente"
          name="mensaje_portal"
          errors={errs}
          hint="Lo ve el cliente en /pedidos/[token]/cliente antes de armar el pedido."
        >
          <Textarea
            id="mensaje_portal"
            name="mensaje_portal"
            rows={2}
            defaultValue={tenant.mensaje_portal ?? ""}
          />
        </Field>
      </section>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
