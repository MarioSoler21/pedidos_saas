export const ROL_LABEL: Record<string, string> = {
  admin: "Admin",
  vendedor: "Vendedor",
  despacho: "Despacho",
  operador_bodega: "Operador de bodega",
  cliente_portal: "Cliente (portal)",
};

export const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const TIPO_CLIENTE_LABEL: Record<string, string> = {
  pulperia: "Pulpería",
  minimarket: "Minimarket",
  mayorista: "Mayorista",
  contratista: "Contratista",
  reventa: "Reventa",
  otro: "Otro",
};

export const UNIDAD_LABEL: Record<string, string> = {
  unidad: "Unidad",
  caja: "Caja",
  saco: "Saco",
  libra: "Libra",
  kg: "Kg",
  litro: "Litro",
  docena: "Docena",
};

export const money = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
});
