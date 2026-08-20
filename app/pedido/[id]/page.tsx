"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PackageSearch, Truck } from "lucide-react";
import { getStoredOrder, updateStoredOrder } from "@/lib/orders-store";
import { buildFakePixCode } from "@/lib/actions/orders";
import { PRODUCTION_STATUS_ORDER, type Order } from "@/lib/types";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { DesignApprovalPanel } from "@/components/order/DesignApprovalPanel";
import { PixPanel } from "@/components/order/PixPanel";
import { formatBRL, formatDateLong } from "@/lib/format";
import { buildWhatsappLink, WHATSAPP_MESSAGES } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    setOrder(getStoredOrder(id) ?? null);
  }, [id]);

  function approvePayment() {
    if (!order) return;
    updateStoredOrder(order.id, { paymentStatus: "aprovado", status: "pagamento_aprovado" });
    setOrder({ ...order, paymentStatus: "aprovado", status: "pagamento_aprovado" });
  }

  function advanceStatus() {
    if (!order) return;
    const idx = PRODUCTION_STATUS_ORDER.indexOf(order.status);
    const next = PRODUCTION_STATUS_ORDER[Math.min(idx + 1, PRODUCTION_STATUS_ORDER.length - 1)];
    const trackingCode = next === "enviado" || next === "entregue" ? order.trackingCode ?? `BR${Math.floor(100000000 + Math.random() * 899999999)}BR` : order.trackingCode;
    updateStoredOrder(order.id, { status: next, trackingCode });
    setOrder({ ...order, status: next, trackingCode });
  }

  if (order === undefined) return null;

  if (order === null) {
    return (
      <div className="container-page flex flex-col items-center gap-3 py-24 text-center">
        <PackageSearch size={44} className="text-graphite-300" />
        <h1 className="font-display text-2xl font-bold text-ink">Pedido não encontrado</h1>
        <p className="text-sm text-graphite-400">Confira o link ou acesse seus pedidos na sua conta.</p>
        <Link href="/conta/pedidos" className="mt-2 text-sm font-semibold text-accent">Ver meus pedidos →</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="flex items-center gap-2 text-sm font-semibold text-ok">
            <CheckCircle2 size={16} /> Pedido realizado com sucesso
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">Pedido {order.code}</h1>
          <p className="text-sm text-graphite-400">Previsão de entrega: {formatDateLong(order.estimatedDate)}</p>
        </div>
        <a
          href={buildWhatsappLink(WHATSAPP_MESSAGES.order(order.code))}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-700 hover:border-accent hover:text-accent"
        >
          <MessageCircle size={15} /> Falar sobre este pedido
        </a>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {order.paymentMethod === "pix" && order.paymentStatus === "aguardando" && (
            <PixPanel code={buildFakePixCode(order.code, order.total)} amount={order.total} orderCode={order.code} />
          )}
          {order.paymentStatus === "aprovado" && (
            <p className="flex items-center gap-2 rounded-xl bg-ok/10 px-4 py-3 text-sm font-medium text-ok">
              <CheckCircle2 size={16} /> Pagamento aprovado
            </p>
          )}

          <section className="rounded-2xl border border-graphite-100 p-6">
            <h2 className="mb-5 font-display text-lg font-semibold text-ink">Acompanhamento da produção</h2>
            <OrderTimeline status={order.status} />
            {order.trackingCode && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-graphite-100/70 px-4 py-3 text-sm">
                <Truck size={16} className="text-accent" />
                Código de rastreamento: <span className="font-semibold text-ink">{order.trackingCode}</span>
              </div>
            )}
          </section>
          <DesignApprovalPanel orderId={order.id} />

          <section className="rounded-2xl border border-dashed border-accent/40 bg-accent-100/30 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">Ambiente de demonstração</p>
            <p className="mb-3 text-sm text-graphite-600">
              Em produção, esses avanços acontecem automaticamente pelo painel administrativo (fila de produção).
              Aqui você pode simular o fluxo:
            </p>
            <div className="flex flex-wrap gap-2">
              {order.paymentStatus === "aguardando" && (
                <button onClick={approvePayment} className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white">
                  Simular pagamento aprovado
                </button>
              )}
              {order.status !== "entregue" && order.paymentStatus === "aprovado" && (
                <button onClick={advanceStatus} className="flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white">
                  Avançar etapa <ArrowRight size={13} />
                </button>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Itens do pedido</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-graphite-600">{item.quantity}x {item.name}</span>
                  <span className="font-medium text-ink">{formatBRL(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="h-fit space-y-5 rounded-2xl border border-graphite-100 bg-graphite-100/40 p-6">
          <div>
            <h3 className="mb-2 font-display text-sm font-semibold text-ink">Entrega</h3>
            <p className="text-sm text-graphite-600">
              {order.address.street}, {order.address.number} {order.address.complement && `- ${order.address.complement}`}
              <br />
              {order.address.district} — {order.address.city}/{order.address.state}
              <br />
              CEP {order.address.cep}
            </p>
            <p className="mt-1 text-xs text-graphite-400">{order.shippingMethod}</p>
          </div>
          <div className="space-y-1.5 border-t border-graphite-200 pt-4 text-sm">
            <div className="flex justify-between text-graphite-500"><span>Subtotal</span><span>{formatBRL(order.subtotal)}</span></div>
            <div className="flex justify-between text-graphite-500"><span>Desconto</span><span>- {formatBRL(order.discount)}</span></div>
            <div className="flex justify-between text-graphite-500"><span>Frete</span><span>{formatBRL(order.shippingCost)}</span></div>
            <div className="flex justify-between border-t border-graphite-200 pt-2 font-display text-base font-bold text-ink"><span>Total</span><span>{formatBRL(order.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
