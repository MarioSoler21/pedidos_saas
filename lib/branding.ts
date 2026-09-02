import type { CSSProperties } from "react";

export const BRANDING_DEFAULTS = {
  nombreApp: "Pedidos B2B",
  subtituloApp: "Distribuidoras",
} as const;

export type TenantBranding = {
  nombreEmpresa: string;
  nombreApp: string;
  subtituloApp: string;
  mensajePortal: string | null;
  logoUrl: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  colorSidebar: string | null;
};

type BrandingRow = {
  nombre_empresa?: string | null;
  nombre_app?: string | null;
  subtitulo_app?: string | null;
  mensaje_portal?: string | null;
  logo_url?: string | null;
  color_primario?: string | null;
  color_secundario?: string | null;
  color_sidebar?: string | null;
};

export function toBranding(row: BrandingRow | null | undefined): TenantBranding {
  return {
    nombreEmpresa: row?.nombre_empresa ?? "",
    nombreApp: row?.nombre_app?.trim() || BRANDING_DEFAULTS.nombreApp,
    subtituloApp: row?.subtitulo_app?.trim() || BRANDING_DEFAULTS.subtituloApp,
    mensajePortal: row?.mensaje_portal?.trim() || null,
    logoUrl: row?.logo_url?.trim() || null,
    colorPrimario: normalizeHex(row?.color_primario),
    colorSecundario: normalizeHex(row?.color_secundario),
    colorSidebar: normalizeHex(row?.color_sidebar),
  };
}

function normalizeHex(v: string | null | undefined): string | null {
  const s = v?.trim().toLowerCase();
  return s && /^#[0-9a-f]{6}$/.test(s) ? s : null;
}

/** Texto legible (#0a0a0a claro / #ffffff oscuro) sobre un color de fondo hex. */
export function readableOn(hex: string): "#0a0a0a" | "#ffffff" {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return "#0a0a0a";
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const L =
    0.2126 * lin(parseInt(m[1], 16)) +
    0.7152 * lin(parseInt(m[2], 16)) +
    0.0722 * lin(parseInt(m[3], 16));
  return L > 0.4 ? "#0a0a0a" : "#ffffff";
}

/**
 * CSS custom properties para un wrapper: solo setea lo que el tenant definió.
 * Las vars heredan, así que reestilan a todos los componentes shadcn de adentro.
 */
export function brandingStyle(b: TenantBranding): CSSProperties {
  const s: Record<string, string> = {};

  if (b.colorPrimario) {
    const fg = readableOn(b.colorPrimario);
    s["--primary"] = b.colorPrimario;
    s["--primary-foreground"] = fg;
    s["--sidebar-primary"] = b.colorPrimario;
    s["--sidebar-primary-foreground"] = fg;
    s["--ring"] = b.colorPrimario;
  }
  if (b.colorSecundario) {
    const fg = readableOn(b.colorSecundario);
    s["--secondary"] = b.colorSecundario;
    s["--secondary-foreground"] = fg;
    s["--accent"] = b.colorSecundario;
    s["--accent-foreground"] = fg;
    s["--sidebar-accent"] = b.colorSecundario;
    s["--sidebar-accent-foreground"] = fg;
  }
  if (b.colorSidebar) {
    s["--sidebar"] = b.colorSidebar;
    s["--sidebar-foreground"] = readableOn(b.colorSidebar);
    s["--sidebar-border"] = "color-mix(in srgb, currentColor 12%, transparent)";
  }

  return s as CSSProperties;
}
