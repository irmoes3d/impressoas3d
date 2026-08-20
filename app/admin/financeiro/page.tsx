"use client";

import { useState } from "react";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { KpiCard } from "@/components/admin/KpiCard";
import { formatBRL, formatDate } from "@/lib/format";
import { StatusPill, paymentTone } from "@/components/admin/StatusPill";

type PaymentFilter = "todos" | "ok" | "pendente";

const TABS: { value: PaymentFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ok", label: "Pagamento OK" },
  { value: "pendente", label: "Pendente" },
];

export default function AdminFinanceiroPage() {
  const orders = useAllOrders();
  const [filter, setFilter] = useState<PaymentFilter>("todos");

  const received = orders.filter((o) => o.paymentStatus === "aprovado").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.paymentStatus === "aguardando").reduce((s, o) => s + o.total, 0);
  const estimatedCost = received * 0.32;
  const estimatedProfit = received - estimatedCost;

  const filtered = orders.filter((o) => {
    if (filter === "ok") return o.paymentStatus === "aprovado";
    if (filter === "pendente") return o.paymentStatus === "aguardando";
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Financeiro</h1>
        <p className="text-sm text-graphite-400">Visão consolidada de recebimentos e custo estimado de produção.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={DollarSign} label="Recebido" value={formatBRL(received)} />
        <KpiCard icon={Wallet} label="Aguardando pagamento" value={formatBRL(pending)} />
        <KpiCard icon={TrendingDown} label="Custo estimado (material)" value={formatBRL(estimatedCost)} />
        <KpiCard icon={TrendingUp} label="Lucro estimado" value={formatBRL(estimatedProfit)} hint="~68% de margem" />
      </div>

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              filter === t.value ? "bg-ink text-white" : "bg-graphite-100 text-graphite-500 hover:bg-graphite-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-graphite-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite-100/60 text-xs uppercase tracking-wide text-graphite-400">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-graphite-100">
                <td className="px-4 py-3 font-medium text-ink">{o.code}</td>
                <td className="px-4 py-3 text-graphite-500">{o.paymentMethod.replace("_", " ")}</td>
                <td className="px-4 py-3"><StatusPill label={o.paymentStatus === "aprovado" ? "OK" : o.paymentStatus} tone={paymentTone(o.paymentStatus)} /></td>
                <td className="px-4 py-3 font-medium text-ink">{formatBRL(o.total)}</td>
                <td className="px-4 py-3 text-graphite-400">{formatDate(o.createdAt.slice(0, 10))}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-graphite-400">Nenhum pedido nesse filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
