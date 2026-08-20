"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { updateStoredOrder, getStoredOrder } from "@/lib/orders-store";
import { formatBRL, formatDate } from "@/lib/format";
import { PRODUCTION_STATUS_LABEL, PRODUCTION_STATUS_ORDER, type Order, type PaymentStatus, type ProductionStatus } from "@/lib/types";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { DesignApprovalPanel } from "@/components/order/DesignApprovalPanel";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
const printers: Array<{ id: string; name: string }> = [];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const allOrders = useAllOrders();
  const [order, setOrder] = useState<Order | undefined>();
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    setOrder(allOrders.find((o) => o.id === id));
  }, [allOrders, id]);

  async function patch(update: Partial<Order>) {
    if (!order) return;
    if (update.status === "fila_impressao") {
      const supabase = createSupabaseBrowserClient();
      const { data: preview } = await supabase.from("order_files").select("id").eq("order_id", order.id).eq("file_kind", "previa").limit(1);
      if (preview?.length) {
        const { data: approval } = await supabase.from("design_approvals").select("status").eq("order_id", order.id).maybeSingle();
        if (approval?.status !== "aprovado") { setStatusError("O cliente precisa aprovar a prévia antes de entrar na fila de impressão."); return; }
      }
    }
    setStatusError(null);
    const next = { ...order, ...update };
    setOrder(next);
    const dbUpdate: Record<string, unknown> = {};
    if (update.status) dbUpdate.status = update.status;
    if (update.paymentStatus) dbUpdate.payment_status = update.paymentStatus;
    if ("printerId" in update) dbUpdate.printer_id = update.printerId ?? null;
    if ("trackingCode" in update) dbUpdate.tracking_code = update.trackingCode ?? null;
    await createSupabaseBrowserClient().from("orders").update(dbUpdate).eq("id", order.id);
    if (getStoredOrder(order.id)) updateStoredOrder(order.id, update);
  }

  if (!order) return <p className="text-sm text-graphite-400">Carregando pedido...</p>;

  return (
    <div>
      <Link href="/admin/pedidos" className="mb-5 inline-flex items-center gap-1.5 text-sm text-graphite-500 hover:text-accent">
        <ArrowLeft size={15} /> Voltar aos pedidos
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Pedido {order.code}</h1>
          <p className="text-sm text-graphite-400">{order.customerName} · {order.customerEmail} · {order.customerPhone}</p>
        </div>
        <p className="font-display text-xl font-bold text-ink">{formatBRL(order.total)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-graphite-100 bg-white p-5">
            <h2 className="mb-4 font-display text-sm font-semibold text-ink">Itens</h2>
            <div className="space-y-2 text-sm">
              {order.items.map((i) => (
                <div key={i.id} className="flex justify-between text-graphite-600">
                  <span>{i.quantity}x {i.name} {i.customization.colorName && `· ${i.customization.colorName}`}</span>
                  <span className="font-medium text-ink">{formatBRL(i.unitPrice * i.quantity)}</span>
                </div>
              ))}
            </div>
          </section>
          <DesignApprovalPanel orderId={order.id} staff />

          <section className="rounded-2xl border border-graphite-100 bg-white p-5">
            <h2 className="mb-4 font-display text-sm font-semibold text-ink">Linha do tempo de produção</h2>
            <OrderTimeline status={order.status} />
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-graphite-100 bg-white p-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Status da produção</label>
            <select
              value={order.status}
              onChange={(e) => patch({ status: e.target.value as ProductionStatus })}
              className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {PRODUCTION_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{PRODUCTION_STATUS_LABEL[s]}</option>
              ))}
            </select>
            {statusError && <p className="mt-2 text-xs text-danger">{statusError}</p>}

            <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Status do pagamento</label>
            <select
              value={order.paymentStatus}
              onChange={(e) => patch({ paymentStatus: e.target.value as PaymentStatus })}
              className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {["aguardando", "aprovado", "recusado", "estornado"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Impressora</label>
            <select
              value={order.printerId ?? ""}
              onChange={(e) => patch({ printerId: e.target.value || undefined })}
              className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">Não atribuída</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Código de rastreamento</label>
            <input
              value={order.trackingCode ?? ""}
              onChange={(e) => patch({ trackingCode: e.target.value })}
              placeholder="BR000000000BR"
              className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </section>

          <section className="rounded-2xl border border-graphite-100 bg-white p-5 text-sm">
            <h2 className="mb-3 font-display text-sm font-semibold text-ink">Entrega</h2>
            <p className="text-graphite-600">
              {order.address.street}, {order.address.number} — {order.address.district}, {order.address.city}/{order.address.state}
            </p>
            <p className="mt-1 text-xs text-graphite-400">CEP {order.address.cep} · {order.shippingMethod}</p>
            <p className="mt-3 text-xs text-graphite-400">Pedido em {formatDate(order.createdAt.slice(0, 10))}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
