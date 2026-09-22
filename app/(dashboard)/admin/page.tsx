import Link from "next/link";
import {
  Users,
  Store,
  Package,
  MapPin,
  Tags,
  Settings2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { getAdminCounts } from "@/lib/data/admin";
import { AdminTabs } from "./_components/admin-tabs";

export default async function AdminPage() {
  const tenant = await getSession();
  const counts = tenant
    ? await getAdminCounts(tenant.id)
    : {
        usuarios: 0,
        clientes: 0,
        productos: 0,
        zonas: 0,
        categorias_producto: 0,
      };

  const secciones: {
    href: string;
    label: string;
    desc: string;
    icon: LucideIcon;
    count?: number;
  }[] = [
    {
      href: "/admin/usuarios",
      label: "Usuarios",
      desc: "Personas y su rol",
      icon: Users,
      count: counts.usuarios,
    },
    {
      href: "/admin/clientes",
      label: "Clientes",
      desc: "Cartera de negocios y link del portal",
      icon: Store,
      count: counts.clientes,
    },
    {
      href: "/admin/productos",
      label: "Productos",
      desc: "Catálogo, precios y unidades",
      icon: Package,
      count: counts.productos,
    },
    {
      href: "/admin/zonas",
      label: "Zonas",
      desc: "Zonas de reparto/venta",
      icon: MapPin,
      count: counts.zonas,
    },
    {
      href: "/admin/categorias",
      label: "Categorías",
      desc: "Categorías del catálogo",
      icon: Tags,
      count: counts.categorias_producto,
    },
    {
      href: "/admin/configuracion",
      label: "Configuración",
      desc: "Nombre, slug y plan del tenant",
      icon: Settings2,
    },
  ];

  return (
    <main className="p-6 lg:p-8">
      <AdminTabs />
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Admin
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestión de datos de {tenant?.nombreEmpresa}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {secciones.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="group block">
              <Card className="h-full transition-colors group-hover:bg-muted/50">
                <CardHeader>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-foreground/10">
                      <Icon className="size-4.5" aria-hidden />
                    </div>
                    {s.count !== undefined && (
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {s.count}
                      </span>
                    )}
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {s.label}
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                  <CardDescription>{s.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
