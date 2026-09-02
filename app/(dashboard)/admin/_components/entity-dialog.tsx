"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "./submit-button";
import type { FormState } from "@/lib/validation/admin";

const initial: FormState = { ok: false };

type Errores = Record<string, string[]> | undefined;

export function EntityDialog({
  trigger,
  title,
  description,
  action,
  submitLabel = "Guardar",
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  submitLabel?: string;
  children: (errors: Errores) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, initial);

  useEffect(() => {
    if (state.ok) {
      toast.success("Guardado.");
      // Cerrar el diálogo al confirmarse la acción del servidor.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {children(state.fieldErrors)}
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <SubmitButton>{submitLabel}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Field({
  label,
  name,
  errors,
  hint,
  children,
}: {
  label: string;
  name: string;
  errors: Errores;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {errors?.[name]?.[0] && (
        <p className="text-xs text-destructive">{errors[name][0]}</p>
      )}
    </div>
  );
}

const NONE = "__none__";

/** Select controlado + hidden input. La opción "ninguna" envía "" al form. */
export function SelectField({
  name,
  label,
  errors,
  options,
  defaultValue = "",
  placeholder = "Elegir…",
  includeNone = false,
  noneLabel = "—",
}: {
  name: string;
  label: string;
  errors: Errores;
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
  includeNone?: boolean;
  noneLabel?: string;
}) {
  const [value, setValue] = useState(
    defaultValue === "" && includeNone ? NONE : defaultValue,
  );
  return (
    <Field label={label} name={name} errors={errors}>
      <input type="hidden" name={name} value={value === NONE ? "" : value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeNone && <SelectItem value={NONE}>{noneLabel}</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** Switch controlado + hidden input que envía "true"/"false" de forma fiable. */
export function SwitchField({
  name,
  label,
  defaultChecked = true,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={name}>{label}</Label>
      <input type="hidden" name={name} value={String(checked)} />
      <Switch id={name} checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}
