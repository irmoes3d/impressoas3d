"use client";

import { useState } from "react";
import { Info, Truck } from "lucide-react";

const REGIONS = [
  { uf: "SP/RJ/MG/ES", base: 22 },
  { uf: "PR/SC/RS", base: 26 },
  { uf: "Nordeste", base: 30 },
  { uf: "Norte/Centro-Oeste", base: 32 },
];

export default function AdminFretesPage() {
  const [rows, setRows] = useState(REGIONS);
  const [freeShippingMin, setFreeShippingMin] = useState(250);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Fretes</h1>
        <p className="text-sm text-graphite-400">Faixas de frete usadas na simulação do checkout.</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-accent-100/60 p-4 text-xs text-accent">
        <Info size={15} className="mt-0.5 shrink-0" />
        Estrutura pronta para integração real com Correios e Melhor Envio. Enquanto a chave da API
        não é configurada, o checkout usa esses valores base por região + peso do pedido.
      </div>

      <div className="overflow-hidden rounded-2xl border border-graphite-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite-100/60 text-xs uppercase tracking-wide text-graphite-400">
            <tr><th className="px-4 py-3">Região</th><th className="px-4 py-3">Valor base (PAC)</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.uf} className="border-t border-graphite-100">
                <td className="flex items-center gap-2 px-4 py-3 font-medium text-ink"><Truck size={14} className="text-accent" /> {r.uf}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={r.base}
                    onChange={(e) => setRows((prev) => prev.map((row, idx) => (idx === i ? { ...row, base: Number(e.target.value) } : row)))}
                    className="w-24 rounded-lg border border-graphite-200 px-2 py-1.5 text-sm outline-none focus:border-accent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-graphite-100 bg-white p-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Frete grátis a partir de (R$)</label>
        <input type="number" value={freeShippingMin} onChange={(e) => setFreeShippingMin(Number(e.target.value))} className="w-40 rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
      </div>

      <button className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-600">Salvar configurações</button>
    </div>
  );
}
