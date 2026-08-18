"use client";

import { useMemo, useState } from "react";
import { getCategoryBreakdown, getSalesLast30Days, getTopSellingProducts } from "@/lib/data/dashboard";
import { SalesChart, TopProductsChart } from "@/components/admin/DashboardCharts";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { useAllQuotes } from "@/lib/admin/useAllQuotes";
import { customers } from "@/lib/data/customers";
import { formatBRL } from "@/lib/format";

const PERIODS = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

export default function AdminRelatoriosPage() {
  const [period, setPeriod] = useState(30);
  const orders = useAllOrders();
  const quotes = useAllQuotes();
  const sales = useMemo(() => getSalesLast30Days(period), [period]);
  const categoryBreakdown = getCategoryBreakdown();
  const topProducts = getTopSellingProducts();

  const totalSales = sales.reduce((s, d) => s + d.vendas, 0);
  const avgTicket = orders.length ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0;
  const approvedQuotes = quotes.filter((q) => q.status === "aprovado").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Relatórios</h1>
          <p className="text-sm text-graphite-400">Desempenho de vendas, produção e clientes.</p>
        </div>
        <div className="flex rounded-full bg-graphite-100 p-1">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${period === p.value ? "bg-white text-ink shadow-sm" : "text-graphite-500"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ReportStat label="Vendas no período" value={formatBRL(totalSales)} />
        <ReportStat label="Pedidos" value={String(orders.length)} />
        <ReportStat label="Ticket médio" value={formatBRL(avgTicket)} />
        <ReportStat label="Orçamentos aprovados" value={String(approvedQuotes)} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-graphite-100 bg-white p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Vendas por período</h2>
          <SalesChart data={sales} />
        </div>
        <div className="rounded-2xl border border-graphite-100 bg-white p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Produtos mais vendidos</h2>
          <TopProductsChart data={topProducts} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-graphite-100 bg-white p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Vendas por categoria</h2>
          <div className="space-y-2.5">
            {categoryBreakdown.map((c) => {
              const max = categoryBreakdown[0].vendas;
              return (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-xs text-graphite-500"><span>{c.name}</span><span>{c.vendas}</span></div>
                  <div className="h-2 rounded-full bg-graphite-100">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${(c.vendas / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-graphite-100 bg-white p-5">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink">Clientes</h2>
          <p className="text-3xl font-display font-bold text-ink">{customers.length}</p>
          <p className="text-sm text-graphite-400">clientes cadastrados</p>
          <p className="mt-4 text-xs text-graphite-400">
            {orders.length} pedidos realizados no total, {formatBRL(orders.reduce((s, o) => s + o.total, 0))} em vendas acumuladas.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-graphite-100 bg-white p-4">
      <p className="font-display text-xl font-bold text-ink">{value}</p>
      <p className="text-xs text-graphite-400">{label}</p>
    </div>
  );
}
