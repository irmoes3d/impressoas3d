"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, FileText, Heart, Package } from "lucide-react";
import { getStoredOrders } from "@/lib/orders-store";
import { useFavorites } from "@/lib/context/FavoritesContext";
import { getStoredQuotes } from "@/lib/quotes-store";
import { formatBRL } from "@/lib/format";
import { PRODUCTION_STATUS_LABEL } from "@/lib/types";

export default function ContaDashboardPage() {
  const [orderCount, setOrderCount] = useState(0);
  const [lastOrder, setLastOrder] = useState<ReturnType<typeof getStoredOrders>[number] | null>(null);
  const { ids } = useFavorites();
  const [quoteCount, setQuoteCount] = useState(0);

  useEffect(() => {
    const orders = getStoredOrders();
    setOrderCount(orders.length);
    setLastOrder(orders[0] ?? null);
    setQuoteCount(getStoredQuotes().length);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Package} label="Pedidos" value={orderCount} href="/conta/pedidos" />
        <StatCard icon={Heart} label="Favoritos" value={ids.length} href="/conta/favoritos" />
        <StatCard icon={FileText} label="Orçamentos" value={quoteCount} href="/conta/orcamentos" />
      </div>

      {lastOrder && (
        <div className="rounded-2xl border border-graphite-100 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Último pedido</h2>
            <Link href={`/pedido/${lastOrder.id}`} className="flex items-center gap-1 text-sm font-semibold text-accent">
              Acompanhar <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-sm text-graphite-600">Pedido {lastOrder.code} · {formatBRL(lastOrder.total)}</p>
          <p className="text-xs text-graphite-400">{PRODUCTION_STATUS_LABEL[lastOrder.status]}</p>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-graphite-200 p-6 text-sm text-graphite-500">
        Precisa de ajuda com algum pedido ou projeto? Fale com a gente pelo WhatsApp a qualquer momento.
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href }: { icon: typeof Package; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-graphite-100 p-5 transition hover:border-accent hover:shadow-sm">
      <Icon size={20} className="mb-3 text-accent" />
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm text-graphite-400">{label}</p>
    </Link>
  );
}
