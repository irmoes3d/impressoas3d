"use client";

import { useEffect, useMemo, useState } from "react";
import { SalesChart, TopProductsChart } from "@/components/admin/DashboardCharts";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { useAllQuotes } from "@/lib/admin/useAllQuotes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/format";

const PERIODS = [7, 30, 90];

export default function AdminRelatoriosPage() {
  const [period, setPeriod] = useState(30);
  const [expenses, setExpenses] = useState(0);
  const [losses, setLosses] = useState(0);
  const orders = useAllOrders();
  const quotes = useAllQuotes();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    Promise.all([supabase.from("financial_expenses").select("amount"), supabase.from("production_losses").select("cost")]).then(([expenseResult, lossResult]) => {
      setExpenses((expenseResult.data ?? []).reduce((sum, item) => sum + Number(item.amount), 0));
      setLosses((lossResult.data ?? []).reduce((sum, item) => sum + Number(item.cost), 0));
    });
  }, []);

  const report = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate() - (period - 1)); start.setHours(0, 0, 0, 0);
    const selected = orders.filter((order) => new Date(order.createdAt) >= start);
    const approved = selected.filter((order) => order.paymentStatus === "aprovado");
    const sales = Array.from({ length: period }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); const key = date.toISOString().slice(0, 10); return { date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), vendas: approved.filter((order) => order.createdAt.slice(0, 10) === key).reduce((sum, order) => sum + order.total, 0) }; });
    const totals = new Map<string, number>(); approved.forEach((order) => order.items.forEach((item) => totals.set(item.name, (totals.get(item.name) ?? 0) + item.quantity)));
    return { selected, revenue: approved.reduce((sum, order) => sum + order.total, 0), sales, top: [...totals.entries()].sort((a,b) => b[1]-a[1]).slice(0,6).map(([name,vendas]) => ({ name, vendas })) };
  }, [orders, period]);
  const net = report.revenue - expenses - losses;

  return <div>
    <div className="mb-6 flex items-end justify-between gap-3"><div><h1 className="font-display text-2xl font-bold">Relatório gerencial</h1><p className="text-sm text-graphite-400">Resultado real da operação.</p></div><div className="flex rounded-full bg-graphite-100 p-1">{PERIODS.map((value) => <button key={value} onClick={() => setPeriod(value)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${period === value ? "bg-white shadow-sm" : "text-graphite-500"}`}>{value} dias</button>)}</div></div>
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5"><Stat label="Faturamento" value={formatBRL(report.revenue)} /><Stat label="Despesas" value={`− ${formatBRL(expenses)}`} /><Stat label="Perdas" value={`− ${formatBRL(losses)}`} /><Stat label="Lucro líquido" value={formatBRL(net)} highlight /><Stat label="Pedidos" value={String(report.selected.length)} /></div>
    <div className="mb-6 rounded-2xl bg-graphite-900 p-5 text-white"><p className="text-xs uppercase tracking-widest text-white/50">Fechamento</p><p className="mt-2 font-display text-xl font-bold">{formatBRL(report.revenue)} − {formatBRL(expenses)} − {formatBRL(losses)} = <span className={net >= 0 ? "text-green-400" : "text-red-400"}>{formatBRL(net)}</span></p><p className="mt-1 text-xs text-white/50">Faturamento − despesas − perdas = lucro líquido</p></div>
    <div className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-graphite-100 bg-white p-5"><h2 className="mb-4 text-sm font-bold">Faturamento no período</h2><SalesChart data={report.sales} /></div><div className="rounded-2xl border border-graphite-100 bg-white p-5"><h2 className="mb-4 text-sm font-bold">Produtos mais vendidos</h2>{report.top.length ? <TopProductsChart data={report.top} /> : <div className="flex h-72 items-center justify-center text-sm text-graphite-400">Sem vendas no período.</div>}</div></div>
    <p className="mt-6 text-xs text-graphite-400">Orçamentos aprovados: {quotes.filter((quote) => quote.status === "aprovado").length}</p>
  </div>;
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) { return <div className={`rounded-2xl border p-4 ${highlight ? "border-ok/30 bg-ok/5" : "border-graphite-100 bg-white"}`}><p className={`font-display text-xl font-bold ${highlight ? "text-ok" : "text-ink"}`}>{value}</p><p className="text-xs text-graphite-400">{label}</p></div>; }
