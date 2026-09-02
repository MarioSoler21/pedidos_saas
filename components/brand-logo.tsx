import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Marca de la app. El cuadro es un placeholder a la espera del logo real
 * (reemplazar el <ImageIcon> por un <Image src=... /> cuando exista el asset).
 */
export function BrandLogo({
  withWordmark = false,
  className,
}: {
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-foreground/10">
        <ImageIcon className="size-4.5" aria-hidden />
      </div>
      {withWordmark && (
        <div className="leading-tight">
          <p className="font-heading text-sm font-semibold text-foreground">
            Pedidos B2B
          </p>
          <p className="text-xs text-muted-foreground">Distribuidoras</p>
        </div>
      )}
    </div>
  );
}
