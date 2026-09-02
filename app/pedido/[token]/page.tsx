import { redirect } from "next/navigation";

/**
 * Ruta vieja del portal de cliente. El portal ahora vive en
 * /pedidos/[token]/cliente (ver app/pedidos/[token]/cliente/page.tsx).
 */
export default async function PedidoPorTokenLegacy({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/pedidos/${encodeURIComponent(token)}/cliente`);
}
