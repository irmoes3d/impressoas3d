"use client";

import { ShieldCheck } from "lucide-react";
import { formatBRL } from "@/lib/format";

export function PixPanel({ amount, orderCode }: { amount: number; orderCode: string }) {
  return (
    <div className="rounded-2xl border border-graphite-100 bg-white p-6 text-center">
      <ShieldCheck size={32} className="mx-auto text-accent" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-graphite-400">Pix aguardando emissão segura</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{formatBRL(amount)}</p>
      <p className="mt-2 text-xs text-graphite-400">Pedido {orderCode} · Aguardando pagamento</p>
      <p className="mx-auto mt-4 max-w-md rounded-xl bg-graphite-100/70 p-3 text-xs text-graphite-600">
        Nenhum QR Code foi emitido para este pedido. Não realize pagamentos por códigos ou links recebidos fora deste site.
      </p>
    </div>
  );
}
