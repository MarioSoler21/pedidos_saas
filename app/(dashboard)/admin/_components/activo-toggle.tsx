"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import type { FormState } from "@/lib/validation/admin";

const initial: FormState = { ok: false };

/**
 * Toggle de activo/activa (soft delete / reactivar). Envía id + el nuevo valor
 * en el campo "activo"; la action de cada entidad lo mapea a su columna.
 */
export function ActivoToggle({
  id,
  activo,
  action,
}: {
  id: number;
  activo: boolean;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-center">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="activo" value={String(!activo)} />
      <Switch
        checked={activo}
        onCheckedChange={() => formRef.current?.requestSubmit()}
        aria-label={activo ? "Desactivar" : "Activar"}
      />
    </form>
  );
}
