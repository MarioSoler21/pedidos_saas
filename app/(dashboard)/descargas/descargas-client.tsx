"use client";

import { useMemo, useState } from "react";
import {
  FileDown,
  Sheet as SheetIcon,
  Receipt,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EstadoBadge, ESTADO_LABEL } from "@/components/estado-badge";
import type { PedidoReporte } from "@/lib/data/reportes";

const formatoMoneda = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
});

const formatoFecha = new Intl.DateTimeFormat("es-HN", {
  dateStyle: "medium",
});

/** YYYY-MM-DD en el huso horario local, para <input type="date"> y comparar. */
function fechaLocalISO(fecha: Date) {
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function hoyISO() {
  return fechaLocalISO(new Date());
}

function slug(nombre: string) {
  return (
    nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "reporte"
  );
}

function escaparCSV(valor: string | number) {
  const str = String(valor);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function totalItems(pedido: PedidoReporte) {
  return pedido.items.reduce((acc, i) => acc + i.cantidad, 0);
}

export function DescargasClient({
  pedidos,
  nombreEmpresa,
}: {
  pedidos: PedidoReporte[];
  nombreEmpresa: string;
}) {
  const [generando, setGenerando] = useState<"pdf" | "csv" | null>(null);
  const [desde, setDesde] = useState(hoyISO);
  const [hasta, setHasta] = useState(hoyISO);

  const filtroActivo = desde !== "" || hasta !== "";

  const pedidosFiltrados = useMemo(() => {
    if (!filtroActivo) return pedidos;
    return pedidos.filter((p) => {
      const fecha = fechaLocalISO(new Date(p.fecha_pedido));
      if (desde && fecha < desde) return false;
      if (hasta && fecha > hasta) return false;
      return true;
    });
  }, [pedidos, desde, hasta, filtroActivo]);

  const hayPedidos = pedidosFiltrados.length > 0;
  const ventasTotales = pedidosFiltrados
    .filter((p) => p.estado !== "anulado")
    .reduce((sum, p) => sum + p.total, 0);

  function nombreArchivo(extension: string) {
    const rango =
      desde && hasta && desde === hasta
        ? desde
        : `${desde || "inicio"}_a_${hasta || "hoy"}`;
    return `pedidos-${slug(nombreEmpresa)}-${filtroActivo ? rango : "todos"}.${extension}`;
  }

  function descargarPDF() {
    setGenerando("pdf");
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Reporte de pedidos — ${nombreEmpresa}`, 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(
        `Generado el ${new Intl.DateTimeFormat("es-HN", {
          dateStyle: "long",
          timeStyle: "short",
        }).format(new Date())}`,
        14,
        24,
      );

      autoTable(doc, {
        startY: 30,
        head: [["#", "Fecha", "Cliente", "Estado", "Items", "Total"]],
        body: pedidosFiltrados.map((p) => [
          p.numero_pedido,
          formatoFecha.format(new Date(p.fecha_pedido)),
          p.cliente?.nombre_negocio ?? "—",
          ESTADO_LABEL[p.estado],
          totalItems(p),
          formatoMoneda.format(p.total),
        ]),
        foot: [["", "", "", "", "Total", formatoMoneda.format(ventasTotales)]],
        headStyles: { fillColor: [30, 41, 59] },
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
        styles: { fontSize: 9 },
      });

      doc.save(nombreArchivo("pdf"));
      toast.success("PDF descargado");
    } finally {
      setGenerando(null);
    }
  }

  function descargarCSV() {
    setGenerando("csv");
    try {
      const headers = [
        "Numero",
        "Fecha",
        "Cliente",
        "Estado",
        "Items",
        "Subtotal",
        "Descuento",
        "Total",
      ];
      const filas = pedidosFiltrados.map((p) => [
        p.numero_pedido,
        formatoFecha.format(new Date(p.fecha_pedido)),
        p.cliente?.nombre_negocio ?? "",
        ESTADO_LABEL[p.estado],
        totalItems(p),
        p.subtotal.toFixed(2),
        p.descuento.toFixed(2),
        p.total.toFixed(2),
      ]);
      const csv = [headers, ...filas]
        .map((fila) => fila.map(escaparCSV).join(","))
        .join("\r\n");
      const blob = new Blob(["﻿" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo("csv");
      enlace.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exportado");
    } finally {
      setGenerando(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 py-1">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
            Filtrar por fecha
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filtro-desde">Desde</Label>
            <Input
              id="filtro-desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filtro-hasta">Hasta</Label>
            <Input
              id="filtro-hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-40"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDesde(hoyISO());
              setHasta(hoyISO());
            }}
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDesde("");
              setHasta("");
            }}
            disabled={!filtroActivo}
          >
            Ver todos
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-1">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Pedidos {filtroActivo ? "en el rango" : "totales"}
              </p>
              <p className="truncate text-lg font-semibold tabular-nums text-foreground">
                {pedidosFiltrados.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-1">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Ventas {filtroActivo ? "en el rango" : "totales"}
              </p>
              <p className="truncate text-lg font-semibold tabular-nums text-foreground">
                {formatoMoneda.format(ventasTotales)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardContent className="flex h-full flex-wrap items-center justify-center gap-3 py-1">
            <Button
              type="button"
              onClick={descargarPDF}
              disabled={!hayPedidos || generando !== null}
              className="gap-2"
            >
              <FileDown className="size-4" aria-hidden />
              {generando === "pdf" ? "Generando PDF…" : "Descargar PDF"}
            </Button>
            <Button
              type="button"
              onClick={descargarCSV}
              disabled={!hayPedidos || generando !== null}
              variant="outline"
              className="gap-2"
            >
              <SheetIcon className="size-4" aria-hidden />
              {generando === "csv" ? "Generando CSV…" : "Exportar CSV"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
            Pedidos
          </CardTitle>
          <CardDescription>
            {hayPedidos
              ? `${pedidosFiltrados.length} pedido${pedidosFiltrados.length === 1 ? "" : "s"}${
                  filtroActivo ? " en el rango seleccionado" : " en el historial"
                }`
              : filtroActivo
                ? "No hay pedidos en el rango de fechas seleccionado."
                : "Todavía no hay pedidos registrados para este tenant."}
          </CardDescription>
        </CardHeader>
        {hayPedidos && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">#</TableHead>
                  <TableHead scope="col">Fecha</TableHead>
                  <TableHead scope="col">Cliente</TableHead>
                  <TableHead scope="col">Estado</TableHead>
                  <TableHead scope="col" className="text-right">
                    Items
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosFiltrados.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="tabular-nums">
                      {p.numero_pedido}
                    </TableCell>
                    <TableCell>
                      {formatoFecha.format(new Date(p.fecha_pedido))}
                    </TableCell>
                    <TableCell>{p.cliente?.nombre_negocio ?? "—"}</TableCell>
                    <TableCell>
                      <EstadoBadge estado={p.estado} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {totalItems(p)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatoMoneda.format(p.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
