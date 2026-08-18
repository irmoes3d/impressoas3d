"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { formatBRL } from "@/lib/format";

function FakeQr({ seed }: { seed: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells = Array.from({ length: 100 }, (_, i) => ((h >> (i % 24)) ^ (h * (i + 7))) % 3 === 0);
  return (
    <div className="grid grid-cols-10 gap-[3px] rounded-xl bg-white p-3" style={{ width: 176, height: 176 }}>
      {cells.map((filled, i) => (
        <div key={i} className={filled ? "bg-ink" : "bg-transparent"} />
      ))}
    </div>
  );
}

export function PixPanel({ code, amount, orderCode }: { code: string; amount: number; orderCode: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-2xl border border-graphite-100 bg-white p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-graphite-400">Pagamento via Pix</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{formatBRL(amount)}</p>
      <div className="my-5 flex justify-center">
        <FakeQr seed={orderCode} />
      </div>
      <p className="mb-2 text-xs text-graphite-400">Pedido {orderCode} · Aguardando pagamento</p>
      <div className="mx-auto flex max-w-md items-center gap-2 rounded-xl border border-graphite-200 bg-graphite-100/60 px-3 py-2.5 text-left">
        <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-graphite-600">{code}</code>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <p className="mt-4 text-xs text-graphite-400">
        Ambiente de demonstração — pronto para integração real com um provedor Pix (ex: Mercado Pago).
      </p>
    </div>
  );
}
