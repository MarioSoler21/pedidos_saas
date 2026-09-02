"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Copy, RefreshCw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/validation/admin";
import { regenerarTokenCliente } from "./actions";

const initial: FormState = { ok: false };

export function TokenCell({ id, token }: { id: number; token: string }) {
  const [state, formAction] = useActionState(regenerarTokenCliente, initial);

  useEffect(() => {
    if (state.ok) toast.success("Token regenerado. El link anterior dejó de servir.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  const copiar = async () => {
    const url = `${window.location.origin}/pedidos/${token}/cliente`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link del portal copiado.");
    } catch {
      toast.error("No se pudo copiar. Link: " + url);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
        {token.slice(0, 8)}…
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Copiar link del portal"
        onClick={copiar}
      >
        <Copy className="size-3.5" />
      </Button>
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <RegenBtn />
      </form>
    </div>
  );
}

function RegenBtn() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon-xs"
      aria-label="Regenerar token"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <RefreshCw className="size-3.5" />
      )}
    </Button>
  );
}
