"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import type { FormState } from "@/lib/validation/admin";
import { subirLogoTenant, quitarLogoTenant } from "./actions";

const initial: FormState = { ok: false };

export function LogoUploader({
  logoUrl,
  nombreApp,
}: {
  logoUrl: string | null;
  nombreApp: string;
}) {
  const [upState, subir] = useActionState(subirLogoTenant, initial);
  const [rmState, quitar] = useActionState(quitarLogoTenant, initial);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (upState.ok) toast.success("Logo actualizado.");
    else if (upState.error) toast.error(upState.error);
  }, [upState]);

  useEffect(() => {
    if (rmState.ok) toast.success("Logo quitado.");
    else if (rmState.error) toast.error(rmState.error);
  }, [rmState]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <BrandLogo logoUrl={logoUrl} nombre={nombreApp} />

      <form action={subir} className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="hidden"
        />
        <UploadBtn onPick={() => fileRef.current?.click()} />
      </form>

      {logoUrl && (
        <form action={quitar}>
          <Button type="submit" variant="ghost" size="sm">
            Quitar logo
          </Button>
        </form>
      )}
    </div>
  );
}

function UploadBtn({ onPick }: { onPick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onPick}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Upload className="size-4" />
      )}
      {pending ? "Subiendo…" : "Subir logo"}
    </Button>
  );
}
