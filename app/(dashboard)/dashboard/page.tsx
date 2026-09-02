export default function DashboardPage() {
  return (
    <main className="p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Dashboard
      </h1>
      <p className="text-sm text-muted-foreground">
        Métricas del tenant: ventas, pedidos por estado, inventario bajo.
      </p>
    </main>
  );
}
