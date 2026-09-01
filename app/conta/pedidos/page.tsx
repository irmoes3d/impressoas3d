"use client";

import Link from "next/link";
import { Loader2, Package } from "lucide-react";
import { useMyOrders } from "@/lib/customer/useMyOrders";
import { formatBRL, formatDate } from "@/lib/format";
import { PRODUCTION_STATUS_LABEL } from "@/lib/types";

export default function PedidosPage() {
  const { orders, loading } = useMyOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-graphite-200 p-10 text-sm text-graphite-400">
        <Loader2 size={16} className="animate-spin" /> Carregando pedidos...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-graphite-200 p-10 text-center">
        <Package className="mx-auto mb-3 text-graphite-300" size={32} />
        <p className="text-sm text-graphite-500">Você ainda não fez nenhum pedido.</p>
        <Link href="/produtos" className="mt-3 inline-block text-sm font-semibold text-accent">Ver produtos →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link key={order.id} href={`/pedido/${order.id}`} className="flex items-center justify-between rounded-2xl border border-graphite-100 p-5 transition hover:border-accent">
          <div>
            <p className="font-display text-sm font-semibold text-ink">Pedido {order.code}</p>
            <p className="text-xs text-graphite-400">{formatDate(order.createdAt.slice(0, 10))} · {order.items.length} item(ns)</p>
          </div>
          <div className="text-right">
            <p className="font-display text-sm font-bold text-ink">{formatBRL(order.total)}</p>
            <p className="text-xs text-accent">{PRODUCTION_STATUS_LABEL[order.status]}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
