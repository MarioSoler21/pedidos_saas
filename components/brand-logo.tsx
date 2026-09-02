import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { BRANDING_DEFAULTS } from "@/lib/branding";

/**
 * Marca de la app. Si el tenant configuró un logo (logoUrl) se muestra ese;
 * si no, un cuadro placeholder. El wordmark usa el nombre/subtítulo del tenant
 * o los defaults.
 */
export function BrandLogo({
  withWordmark = false,
  logoUrl,
  nombre,
  subtitulo,
  className,
}: {
  withWordmark?: boolean;
  logoUrl?: string | null;
  nombre?: string | null;
  subtitulo?: string | null;
  className?: string;
}) {
  const label = nombre?.trim() || BRANDING_DEFAULTS.nombreApp;
  const sub = subtitulo?.trim() || BRANDING_DEFAULTS.subtituloApp;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={label}
          className="size-9 shrink-0 rounded-lg object-contain ring-1 ring-foreground/10"
        />
      ) : (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-foreground/10">
          <ImageIcon className="size-4.5" aria-hidden />
        </div>
      )}
      {withWordmark && (
        <div className="leading-tight">
          <p className="font-heading text-sm font-semibold text-foreground">
            {label}
          </p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      )}
    </div>
  );
}
