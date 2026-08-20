"use client";

import Link from "next/link";
import { Clock, DollarSign, FileText, PackageCheck, ShoppingBag, Truck, Users, Wallet, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { SalesChart, TopProductsChart } from "@/components/admin/DashboardCharts";
import { StatusPill, paymentTone } from "@/components/admin/StatusPill";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { useAllQuotes } from "@/lib/admin/useAllQuotes";
import { formatBRL, formatDate } from "@/lib/format";

const OPEN_QUOTE_STATUSES = ["novo", "em_analise", "orcamento_enviado"];

export default function AdminDashboardPage() {
  const orders = useAllOrders();
  const quotes = useAllQuotes();

  const today = new Date().toISOString().slice(0, 10);
  const sales = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      vendas: orders.filter((order) => order.paymentStatus === "aprovado" && order.createdAt.slice(0, 10) === key).reduce((sum, order) => sum + order.total, 0),
    };
  });
  const productTotals = new Map<string, number>();
  orders.filter((order) => order.paymentStatus === "aprovado").forEach((order) => order.items.forEach((item) => {
    productTotals.set(item.name, (productTotals.get(item.name) ?? 0) + item.quantity);
  }));
  const topProducts = [...productTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, vendas]) => ({ name, vendas }));

  const salesToday = sales[sales.length - 1].vendas;
  const salesMonth = sales.reduce((s, d) => s + d.vendas, 0);
  const ordersToday = orders.filter((o) => o.createdAt.slice(0, 10) === today).length;
  const inProduction = orders.filter((o) => !["recebido", "enviado", "entregue"].includes(o.status)).length;
  const readyToShip = orders.filter((o) => o.status === "embalando" || o.kanbanStage === "pronto").length;
  const avgTicket = orders.length ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0;

  const paidOrders = orders.filter((o) => o.paymentStatus === "aprovado");
  const pendingOrders = orders.filter((o) => o.paymentStatus === "aguardando");
  const invoicedTotal = paidOrders.reduce((s, o) => s + o.total, 0);
  const pendingTotal = pendingOrders.reduce((s, o) => s + o.total, 0);

  const openQuotes = quotes.filter((q) => OPEN_QUOTE_STATUSES.includes(q.status));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-graphite-400">Visão geral da loja em tempo real.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard icon={DollarSign} label="Vendas hoje" value={formatBRL(salesToday)} />
        <KpiCard icon={TrendingUp} label="Vendas nos últimos 30 dias" value={formatBRL(salesMonth)} />
        <KpiCard icon={ShoppingBag} label="Pedidos hoje" value={String(ordersToday)} />
        <KpiCard icon={Clock} label="Em produção" value={String(inProduction)} />
        <KpiCard icon={PackageCheck} label="Pedidos faturados" value={String(paidOrders.length)} hint={formatBRL(invoicedTotal)} />
        <KpiCard icon={Wallet} label="Pagamentos pendentes" value={String(pendingOrders.length)} hint={formatBRL(pendingTotal)} />
        <KpiCard icon={FileText} label="Orçamentos em aberto" value={String(openQuotes.length)} />
        <KpiCard icon={Truck} label="Prontos para envio" value={String(readyToShip)} />
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-graphite-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink">Orçamentos em aberto</h2>
            <Link href="/admin/orcamentos" className="text-xs font-semibold text-accent hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {openQuotes.slice(0, 5).map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-xl bg-graphite-100/60 px-4 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{q.name}</p>
                  <p className="text-xs text-graphite-400">{formatDate(q.createdAt.slice(0, 10))}</p>
                </div>
                {q.estimatedPrice && <span className="shrink-0 text-xs font-semibold text-ink">{formatBRL(q.estimatedPrice)}</span>}
              </div>
            ))}
            {openQuotes.length === 0 && <p className="text-sm text-graphite-400">Nenhum orçamento em aberto.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-graphite-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink">Pagamentos pendentes</h2>
            <Link href="/admin/financeiro" className="text-xs font-semibold text-accent hover:underline">Ver financeiro</Link>
          </div>
          <div className="space-y-2">
            {pendingOrders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-graphite-100/60 px-4 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{o.code} · {o.customerName}</p>
                  <p className="text-xs text-graphite-400">{formatDate(o.createdAt.slice(0, 10))}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-semibold text-ink">{formatBRL(o.total)}</span>
                  <StatusPill label="Pendente" tone={paymentTone(o.paymentStatus)} />
                </div>
              </div>
            ))}
            {pendingOrders.length === 0 && <p className="text-sm text-graphite-400">Nenhum pagamento pendente.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard icon={PackageCheck} label="Ticket médio" value={formatBRL(avgTicket)} />
        <KpiCard icon={Users} label="Clientes com pedidos" value={String(new Set(orders.map((order) => order.customerEmail)).size)} />
      </div>
    </div>
  );
}
