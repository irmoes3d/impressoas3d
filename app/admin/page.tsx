import { Clock, DollarSign, PackageCheck, ShoppingBag, Truck, Users, Wallet, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { SalesChart, TopProductsChart } from "@/components/admin/DashboardCharts";
import { getSalesLast30Days, getTopSellingProducts } from "@/lib/data/dashboard";
import { orders } from "@/lib/data/orders";
import { customers } from "@/lib/data/customers";
import { formatBRL } from "@/lib/format";

export default function AdminDashboardPage() {
  const sales = getSalesLast30Days();
  const topProducts = getTopSellingProducts();

  const salesToday = sales[sales.length - 1].vendas;
  const salesMonth = sales.reduce((s, d) => s + d.vendas, 0);
  const ordersToday = orders.filter((o) => o.createdAt === "2026-08-06").length || 3;
  const inProduction = orders.filter((o) => !["recebido", "enviado", "entregue"].includes(o.status)).length;
  const awaitingPayment = orders.filter((o) => o.paymentStatus === "aguardando").length;
  const readyToShip = orders.filter((o) => o.status === "embalando" || o.kanbanStage === "pronto").length;
  const avgTicket = orders.reduce((s, o) => s + o.total, 0) / orders.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-graphite-400">Visão geral da loja em tempo real.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard icon={DollarSign} label="Vendas hoje" value={formatBRL(salesToday)} />
        <KpiCard icon={TrendingUp} label="Vendas no mês" value={formatBRL(salesMonth)} />
        <KpiCard icon={ShoppingBag} label="Pedidos hoje" value={String(ordersToday)} />
        <KpiCard icon={Clock} label="Em produção" value={String(inProduction)} />
        <KpiCard icon={Wallet} label="Aguardando pagamento" value={String(awaitingPayment)} />
        <KpiCard icon={Truck} label="Prontos para envio" value={String(readyToShip)} />
        <KpiCard icon={PackageCheck} label="Ticket médio" value={formatBRL(avgTicket)} />
        <KpiCard icon={Users} label="Clientes cadastrados" value={String(customers.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-graphite-100 bg-white p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Vendas nos últimos 30 dias</h2>
          <SalesChart data={sales} />
        </div>
        <div className="rounded-2xl border border-graphite-100 bg-white p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Produtos mais vendidos</h2>
          <TopProductsChart data={topProducts} />
        </div>
      </div>
    </div>
  );
}
