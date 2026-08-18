"use client";

import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { KpiCard } from "@/components/admin/KpiCard";
import { formatBRL, formatDate } from "@/lib/format";
import { StatusPill, paymentTone } from "@/components/admin/StatusPill";

export default function AdminFinanceiroPage() {
  const orders = useAllOrders();
  const received = orders.filter((o) => o.paymentStatus === "aprovado").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.paymentStatus === "aguardando").reduce((s, o) => s + o.total, 0);
  const estimatedCost = received * 0.32;
  const estimatedProfit = received - estimatedCost;

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
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-graphite-100">
                <td className="px-4 py-3 font-medium text-ink">{o.code}</td>
                <td className="px-4 py-3 text-graphite-500">{o.paymentMethod.replace("_", " ")}</td>
                <td className="px-4 py-3"><StatusPill label={o.paymentStatus} tone={paymentTone(o.paymentStatus)} /></td>
                <td className="px-4 py-3 font-medium text-ink">{formatBRL(o.total)}</td>
                <td className="px-4 py-3 text-graphite-400">{formatDate(o.createdAt.slice(0, 10))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
