"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";
import {
  brandingStyle,
  BRANDING_DEFAULTS,
  type TenantBranding,
} from "@/lib/branding";
import { cn } from "@/lib/utils";
import { Field } from "../_components/entity-dialog";

type Errores = Record<string, string[]> | undefined;
type Colores = { primario: string; secundario: string; sidebar: string };

const CAMPOS: { key: keyof Colores; name: string; label: string }[] = [
  { key: "primario", name: "color_primario", label: "Color primario" },
  { key: "secundario", name: "color_secundario", label: "Color secundario" },
  { key: "sidebar", name: "color_sidebar", label: "Fondo del menú lateral" },
];

export function BrandingSection({
  errors,
  nombreApp,
  subtituloApp,
  primario,
  secundario,
  sidebar,
  logoUrl,
}: {
  errors: Errores;
  nombreApp: string | null;
  subtituloApp: string | null;
  primario: string | null;
  secundario: string | null;
  sidebar: string | null;
  logoUrl: string | null;
}) {
  const [nombre, setNombre] = useState(nombreApp ?? "");
  const [subtitulo, setSubtitulo] = useState(subtituloApp ?? "");
  const [colores, setColores] = useState<Colores>({
    primario: primario ?? "",
    secundario: secundario ?? "",
    sidebar: sidebar ?? "",
  });

  const set = (key: keyof Colores, value: string) =>
    setColores((c) => ({ ...c, [key]: value }));

  const preview: TenantBranding = {
    nombreEmpresa: "",
    nombreApp: nombre.trim() || BRANDING_DEFAULTS.nombreApp,
    subtituloApp: subtitulo.trim() || BRANDING_DEFAULTS.subtituloApp,
    mensajePortal: null,
    logoUrl,
    colorPrimario: colores.primario || null,
    colorSecundario: colores.secundario || null,
    colorSidebar: colores.sidebar || null,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre de la app" name="nombre_app" errors={errors}>
          <Input
            id="nombre_app"
            name="nombre_app"
            placeholder={BRANDING_DEFAULTS.nombreApp}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Field>
        <Field label="Subtítulo" name="subtitulo_app" errors={errors}>
          <Input
            id="subtitulo_app"
            name="subtitulo_app"
            placeholder={BRANDING_DEFAULTS.subtituloApp}
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
          />
        </Field>
      </div>

      <div className="space-y-3">
        {CAMPOS.map(({ key, name, label }) => (
          <div key={key} className="flex items-center gap-3">
            <input type="hidden" name={name} value={colores[key]} />
            <input
              type="color"
              aria-label={label}
              value={colores[key] || "#111111"}
              onChange={(e) => set(key, e.target.value)}
              className={cn(
                "size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5",
                !colores[key] && "opacity-50",
              )}
            />
            <div className="min-w-0 flex-1">
              <Label className="text-sm">{label}</Label>
              <p className="text-xs text-muted-foreground">
                {colores[key] || "usa el tema base"}
              </p>
            </div>
            {colores[key] && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => set(key, "")}
              >
                Restablecer
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Preview en vivo */}
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <div
          className="flex items-center gap-3 bg-sidebar p-3 text-sidebar-foreground"
          style={brandingStyle(preview)}
        >
          <BrandLogo
            withWordmark
            logoUrl={logoUrl}
            nombre={preview.nombreApp}
            subtitulo={preview.subtituloApp}
          />
          <span className="ml-auto rounded-md bg-sidebar-accent px-2.5 py-1 text-xs font-medium text-sidebar-accent-foreground">
            Nav activa
          </span>
        </div>
        <div
          className="flex items-center gap-2 bg-card p-3"
          style={brandingStyle(preview)}
        >
          <Button type="button" size="sm">
            Botón
          </Button>
          <Button type="button" size="sm" variant="secondary">
            Secundario
          </Button>
          <span className="text-sm text-primary underline-offset-4">
            Un link
          </span>
        </div>
      </div>
    </div>
  );
}
