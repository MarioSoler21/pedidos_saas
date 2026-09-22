import Link from "next/link";
import {
  Users,
  Truck,
  Settings,
  BarChart3,
  Download,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/session";

const ACCESOS: {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/mis-clientes",
    label: "Mis clientes",
    desc: "Cartera y nuevo pedido",
    icon: Users,
  },
  {
    href: "/despacho",
    label: "Despacho",
    desc: "Pedidos listos para preparar/despachar",
    icon: Truck,
  },
  {
    href: "/admin",
    label: "Admin",
    desc: "Usuarios, zonas, catálogo",
    icon: Settings,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    desc: "Métricas del tenant",
    icon: BarChart3,
  },
  {
    href: "/descargas",
    label: "Descargas",
    desc: "Reportes y facturas PDF",
    icon: Download,
  },
];

export default async function HomePage() {
  const tenant = await getSession();

  return (
    <main className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Hola, {tenant?.nombreEmpresa}
        </h1>
        <p className="text-sm text-muted-foreground">
          Accesos rápidos según tu rol.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACCESOS.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href} className="group block">
              <Card className="h-full transition-colors group-hover:bg-muted/50">
                <CardHeader>
                  <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-foreground/10">
                    <Icon className="size-4.5" aria-hidden />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {a.label}
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                  <CardDescription>{a.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
