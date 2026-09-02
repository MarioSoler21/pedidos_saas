"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Minus, Plus, ShoppingCart, Loader2, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/data/catalogo";
import { enviarPedidoCliente } from "./actions";

const money = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
});

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Fuzzy match simple: substring (mejor) o subsecuencia con penalización por huecos. -1 = no matchea. */
function fuzzyScore(text: string, query: string): number {
  const t = norm(text);
  const q = norm(query).trim();
  if (!q) return 0;

  const idx = t.indexOf(q);
  if (idx === 0) return 1000;
  if (idx > 0) return 850 - idx;

  let from = 0;
  let prev = -1;
  let gap = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, from);
    if (found === -1) return -1;
    if (prev !== -1) gap += found - prev - 1;
    prev = found;
    from = found + 1;
  }
  return 500 - gap * 6;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="h-12 w-full text-base"
      disabled={disabled || pending}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Enviando…
        </>
      ) : (
        "Enviar pedido"
      )}
    </Button>
  );
}

export function PedidoClienteForm({
  token,
  productos,
}: {
  token: string;
  productos: Producto[];
}) {
  const [cant, setCant] = useState<Record<number, number>>({});
  const [query, setQuery] = useState("");

  const setQty = (id: number, next: number, max: number) => {
    const v = Math.max(0, Math.min(Number.isFinite(next) ? next : 0, max));
    setCant((prev) => {
      const copy = { ...prev };
      if (v <= 0) delete copy[id];
      else copy[id] = v;
      return copy;
    });
  };

  const q = query.trim();

  const visibles = useMemo(() => {
    const rows = productos.map((p) => {
      const sel = (cant[p.id] ?? 0) > 0;
      const score = q ? fuzzyScore(`${p.nombre} ${p.sku}`, q) : 0;
      return { p, sel, score };
    });
    const filtradas = q ? rows.filter((r) => r.score >= 0 || r.sel) : rows;
    return filtradas.sort(
      (a, b) =>
        Number(b.sel) - Number(a.sel) ||
        b.score - a.score ||
        a.p.nombre.localeCompare(b.p.nombre),
    );
  }, [productos, cant, q]);

  const lineas = useMemo(
    () =>
      productos
        .filter((p) => (cant[p.id] ?? 0) > 0)
        .map((p) => ({
          producto: p,
          cantidad: cant[p.id],
          importe: cant[p.id] * p.precio,
        })),
    [productos, cant],
  );

  const total = lineas.reduce((acc, l) => acc + l.importe, 0);
  const totalUnidades = lineas.reduce((acc, l) => acc + l.cantidad, 0);
  const vacio = lineas.length === 0;

  return (
    <div className="pb-64">
      {/* Buscador fuzzy */}
      <div className="sticky top-0 z-[5] -mx-4 border-b bg-background px-4 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            enterKeyHint="search"
            placeholder="Buscar producto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 pr-9 pl-8"
          />
          {query && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {q && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {visibles.length} resultado{visibles.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {/* Lista de productos */}
      {visibles.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Sin resultados para «{q}».
        </p>
      ) : (
        <ul className="divide-y">
          {visibles.map(({ p, sel }) => {
            const qty = cant[p.id] ?? 0;
            const sinStock = p.stock_actual <= 0;
            return (
              <li
                key={p.id}
                className={cn(
                  "flex items-center gap-3 py-3",
                  sel && "bg-muted/40",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {money.format(p.precio)}
                    {sinStock ? (
                      <span className="text-destructive"> · sin stock</span>
                    ) : (
                      <span> · {p.stock_actual} disp.</span>
                    )}
                  </p>
                </div>

                {qty === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={sinStock}
                    onClick={() => setQty(p.id, 1, p.stock_actual)}
                  >
                    Agregar
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Quitar uno"
                      onClick={() => setQty(p.id, qty - 1, p.stock_actual)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={p.stock_actual}
                      value={qty}
                      onChange={(e) =>
                        setQty(p.id, Number(e.target.value), p.stock_actual)
                      }
                      className="h-8 w-12 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Agregar uno"
                      disabled={qty >= p.stock_actual}
                      onClick={() => setQty(p.id, qty + 1, p.stock_actual)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Resumen tipo factura, fijo abajo */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-card">
        <div className="mx-auto max-w-md p-4">
          <form action={enviarPedidoCliente}>
            <input type="hidden" name="token" value={token} />
            {lineas.map((l) => (
              <input
                key={l.producto.id}
                type="hidden"
                name={`cantidad_${l.producto.id}`}
                value={l.cantidad}
              />
            ))}

            <div
              className={cn(
                "mb-3 max-h-40 space-y-1.5 overflow-y-auto text-sm",
                vacio && "hidden",
              )}
            >
              {lineas.map((l) => (
                <div
                  key={l.producto.id}
                  className="flex items-baseline justify-between gap-2"
                >
                  <span className="min-w-0 truncate text-muted-foreground">
                    <span className="tabular-nums text-foreground">
                      {l.cantidad}×
                    </span>{" "}
                    {l.producto.nombre}
                  </span>
                  <span className="shrink-0 tabular-nums text-foreground">
                    {money.format(l.importe)}
                  </span>
                </div>
              ))}
            </div>

            {vacio ? (
              <p className="mb-3 flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                <ShoppingCart className="size-4" />
                Tu carrito está vacío
              </p>
            ) : (
              <>
                <Separator className="mb-2" />
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total ({totalUnidades} u.)
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {money.format(total)}
                  </span>
                </div>
              </>
            )}

            <SubmitButton disabled={vacio} />
          </form>
        </div>
      </div>
    </div>
  );
}
