"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { formatBRL, formatDate } from "@/lib/format";
import { PRODUCTION_STATUS_LABEL } from "@/lib/types";
import { StatusPill, paymentTone, productionTone } from "@/components/admin/StatusPill";

export default function AdminPedidosPage() {
  const orders = useAllOrders();
  const [query, setQuery] = useState("");

  const filtered = orders.filter(
    (o) => o.code.toLowerCase().includes(query.toLowerCase()) || o.customerName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Pedidos</h1>
          <p className="text-sm text-graphite-400">{orders.length} pedidos no total</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-graphite-200 bg-white px-3 py-2">
          <Search size={15} className="text-graphite-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por código ou cliente" className="w-56 text-sm outline-none" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-graphite-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite-100/60 text-xs uppercase tracking-wide text-graphite-400">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Itens</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Produção</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-graphite-100 hover:bg-graphite-100/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${o.id}`} className="font-semibold text-accent">{o.code}</Link>
                </td>
                <td className="px-4 py-3 text-graphite-600">{o.customerName}</td>
                <td className="px-4 py-3 text-graphite-500">{o.items.length}</td>
                <td className="px-4 py-3 font-medium text-ink">{formatBRL(o.total)}</td>
                <td className="px-4 py-3"><StatusPill label={o.paymentStatus} tone={paymentTone(o.paymentStatus)} /></td>
                <td className="px-4 py-3"><StatusPill label={PRODUCTION_STATUS_LABEL[o.status]} tone={productionTone(o.status)} /></td>
                <td className="px-4 py-3 text-graphite-400">{formatDate(o.createdAt.slice(0, 10))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
