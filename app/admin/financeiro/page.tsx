"use client";

import { useEffect, useState } from "react";
import { DollarSign, Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { KpiCard } from "@/components/admin/KpiCard";
import { formatBRL, formatDate } from "@/lib/format";
import { StatusPill, paymentTone } from "@/components/admin/StatusPill";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type PaymentFilter = "todos" | "ok" | "pendente";
interface Expense { id: string; description: string; amount: number; expense_date: string }
interface Loss { id: string; description: string; cost: number; quantity_pieces: number }

export default function AdminFinanceiroPage() {
  const orders = useAllOrders();
  const [filter, setFilter] = useState<PaymentFilter>("todos");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [losses, setLosses] = useState<Loss[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    Promise.all([
      supabase.from("financial_expenses").select("*").order("expense_date", { ascending: false }),
      supabase.from("production_losses").select("*").order("created_at", { ascending: false }),
    ]).then(([expenseResult, lossResult]) => {
      setExpenses((expenseResult.data ?? []).map((item) => ({ id: item.id, description: item.description, expense_date: item.expense_date, amount: Number(item.amount) })));
      setLosses((lossResult.data ?? []).map((item) => ({ id: item.id, description: item.description, quantity_pieces: item.quantity_pieces, cost: Number(item.cost) })));
    });
  }, []);

  const received = orders.filter((order) => order.paymentStatus === "aprovado").reduce((sum, order) => sum + order.total, 0);
  const pending = orders.filter((order) => order.paymentStatus === "aguardando").reduce((sum, order) => sum + order.total, 0);
  const expensesTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const lossesTotal = losses.reduce((sum, item) => sum + item.cost, 0);
  const netProfit = received - expensesTotal - lossesTotal;
  const filtered = orders.filter((order) => filter === "ok" ? order.paymentStatus === "aprovado" : filter === "pendente" ? order.paymentStatus === "aguardando" : true);

  async function addExpense(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!description || value <= 0) return;
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("financial_expenses").insert({ description, amount: value, category: "operacional" }).select("*").single();
    if (data) setExpenses((current) => [{ id: data.id, description: data.description, expense_date: data.expense_date, amount: Number(data.amount) }, ...current]);
    setDescription(""); setAmount("");
  }

  return <div>
    <div className="mb-6"><h1 className="font-display text-2xl font-bold text-ink">Financeiro</h1><p className="text-sm text-graphite-400">Faturamento real menos despesas e perdas de produção.</p></div>
    <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-5">
      <KpiCard icon={DollarSign} label="Faturamento recebido" value={formatBRL(received)} />
      <KpiCard icon={Wallet} label="Aguardando pagamento" value={formatBRL(pending)} />
      <KpiCard icon={TrendingDown} label="Despesas" value={formatBRL(expensesTotal)} />
      <KpiCard icon={TrendingDown} label="Perdas" value={formatBRL(lossesTotal)} />
      <KpiCard icon={TrendingUp} label="Lucro líquido" value={formatBRL(netProfit)} hint="Faturamento − despesas − perdas" />
    </div>
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
      <form onSubmit={addExpense} className="rounded-2xl border border-graphite-100 bg-white p-5"><h2 className="mb-4 font-display text-sm font-semibold text-ink">Registrar despesa</h2><div className="flex gap-2"><input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" className="min-w-0 flex-1 rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" /><input required type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="R$" className="w-28 rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" /><button className="rounded-xl bg-accent px-3 text-white"><Plus size={16} /></button></div><div className="mt-4 space-y-2">{expenses.slice(0, 4).map((item) => <div key={item.id} className="flex justify-between text-xs"><span className="text-graphite-500">{item.description}</span><strong>{formatBRL(item.amount)}</strong></div>)}</div></form>
      <div className="rounded-2xl border border-graphite-100 bg-white p-5"><h2 className="mb-4 font-display text-sm font-semibold text-ink">Perdas registradas</h2><div className="space-y-2">{losses.slice(0, 5).map((item) => <div key={item.id} className="flex justify-between text-xs"><span className="text-graphite-500">{item.description} · {item.quantity_pieces} peça(s)</span><strong className="text-danger">{formatBRL(item.cost)}</strong></div>)}{losses.length === 0 && <p className="text-xs text-graphite-400">Nenhuma perda registrada.</p>}</div></div>
    </div>
    <div className="mb-4 flex gap-2">{([['todos','Todos'],['ok','Pagamento OK'],['pendente','Pendente']] as const).map(([value,label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${filter === value ? "bg-ink text-white" : "bg-graphite-100 text-graphite-500"}`}>{label}</button>)}</div>
    <div className="overflow-x-auto rounded-2xl border border-graphite-100 bg-white"><table className="w-full text-left text-sm"><thead className="bg-graphite-100/60 text-xs uppercase tracking-wide text-graphite-400"><tr><th className="px-4 py-3">Pedido</th><th className="px-4 py-3">Método</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Data</th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} className="border-t border-graphite-100"><td className="px-4 py-3 font-medium">{order.code}</td><td className="px-4 py-3">{order.paymentMethod.replaceAll("_", " ")}</td><td className="px-4 py-3"><StatusPill label={order.paymentStatus} tone={paymentTone(order.paymentStatus)} /></td><td className="px-4 py-3 font-medium">{formatBRL(order.total)}</td><td className="px-4 py-3 text-graphite-400">{formatDate(order.createdAt.slice(0,10))}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-graphite-400">Nenhum pedido nesse filtro.</td></tr>}</tbody></table></div>
  </div>;
}
