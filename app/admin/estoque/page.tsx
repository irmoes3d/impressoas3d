"use client";

import { useState } from "react";
import { AlertTriangle, Printer as PrinterIcon } from "lucide-react";
import { printers as seedPrinters } from "@/lib/data/printers";
import { materials as seedMaterials } from "@/lib/data/materials";
import type { Printer, PrinterStatus } from "@/lib/types";
import { StatusPill } from "@/components/admin/StatusPill";

const PRINTER_STATUS_LABEL: Record<PrinterStatus, string> = {
  disponivel: "Disponível", imprimindo: "Imprimindo", manutencao: "Manutenção", offline: "Offline",
};
const PRINTER_TONE: Record<PrinterStatus, "ok" | "info" | "warn" | "neutral"> = {
  disponivel: "ok", imprimindo: "info", manutencao: "warn", offline: "neutral",
};

export default function EstoquePage() {
  const [printers, setPrinters] = useState<Printer[]>(seedPrinters);

  function setStatus(id: string, status: PrinterStatus) {
    setPrinters((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <PrinterIcon size={18} className="text-accent" />
          <h1 className="font-display text-2xl font-bold text-ink">Impressoras</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {printers.map((p) => (
            <div key={p.id} className="rounded-2xl border border-graphite-100 bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-ink">{p.name}</p>
                <StatusPill label={PRINTER_STATUS_LABEL[p.status]} tone={PRINTER_TONE[p.status]} />
              </div>
              <p className="mb-3 text-xs text-graphite-400">{p.model}{p.currentOrderCode && ` · pedido ${p.currentOrderCode}`}</p>
              <select value={p.status} onChange={(e) => setStatus(p.id, e.target.value as PrinterStatus)} className="w-full rounded-lg border border-graphite-200 px-2.5 py-1.5 text-xs outline-none focus:border-accent">
                {Object.entries(PRINTER_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold text-ink">Filamentos</h2>
        <div className="overflow-x-auto rounded-2xl border border-graphite-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-graphite-100/60 text-xs uppercase tracking-wide text-graphite-400">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3">Cor</th>
                <th className="px-4 py-3">Disponível</th>
                <th className="px-4 py-3">Custo/kg</th>
                <th className="px-4 py-3">Lote</th>
              </tr>
            </thead>
            <tbody>
              {seedMaterials.map((m) => {
                const low = m.weightAvailableG <= m.lowStockThresholdG;
                return (
                  <tr key={m.id} className="border-t border-graphite-100 hover:bg-graphite-100/40">
                    <td className="px-4 py-3 font-medium text-ink">{m.type}</td>
                    <td className="px-4 py-3 text-graphite-500">{m.brand}</td>
                    <td className="px-4 py-3 text-graphite-500">{m.color}</td>
                    <td className="px-4 py-3">
                      <span className={low ? "flex items-center gap-1 font-medium text-danger" : "text-graphite-600"}>
                        {low && <AlertTriangle size={13} />} {m.weightAvailableG}g
                      </span>
                    </td>
                    <td className="px-4 py-3 text-graphite-500">R$ {m.costPerKg.toFixed(2)}</td>
                    <td className="px-4 py-3 text-graphite-400">{m.batch}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
