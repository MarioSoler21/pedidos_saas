import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EstadoPedido } from "@/lib/data/pedidos";

export const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  despachado: "Despachado",
  entregado: "Entregado",
  anulado: "Anulado",
};

const ESTADO_CLASS: Record<EstadoPedido, string> = {
  pendiente:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  confirmado:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  en_preparacion:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  despachado:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  entregado:
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  anulado: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function EstadoBadge({
  estado,
  className,
}: {
  estado: EstadoPedido;
  className?: string;
}) {
  return (
    <Badge className={cn("border-transparent", ESTADO_CLASS[estado], className)}>
      {ESTADO_LABEL[estado]}
    </Badge>
  );
}
