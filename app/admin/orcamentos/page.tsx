"use client";

import { useEffect, useState } from "react";
import { FileText, Paperclip } from "lucide-react";
import { useAllQuotes } from "@/lib/admin/useAllQuotes";
import type { CustomQuote, QuoteStatus } from "@/lib/types";
import { formatBRL, formatDate } from "@/lib/format";
import { Modal } from "@/components/admin/Modal";
import { StatusPill } from "@/components/admin/StatusPill";

const STATUS_LABEL: Record<QuoteStatus, string> = {
  novo: "Novo", em_analise: "Em análise", orcamento_enviado: "Orçamento enviado", aprovado: "Aprovado", recusado: "Recusado",
};
const STATUS_TONE: Record<QuoteStatus, "neutral" | "warn" | "info" | "ok" | "danger"> = {
  novo: "neutral", em_analise: "warn", orcamento_enviado: "info", aprovado: "ok", recusado: "danger",
};

export default function AdminOrcamentosPage() {
  const seedList = useAllQuotes();
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [selected, setSelected] = useState<CustomQuote | null>(null);

  useEffect(() => setQuotes(seedList), [seedList]);

  const list = quotes;

  function updateQuote(id: string, patch: Partial<CustomQuote>) {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    setSelected((s) => (s && s.id === id ? { ...s, ...patch } : s));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Orçamentos</h1>
        <p className="text-sm text-graphite-400">Solicitações de projetos personalizados e propostas em andamento.</p>
      </div>

      <div className="grid gap-3">
        {list.map((q) => (
          <button key={q.id} onClick={() => setSelected(q)} className="flex items-center justify-between rounded-2xl border border-graphite-100 bg-white p-5 text-left transition hover:border-accent">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display text-sm font-semibold text-ink">{q.name}</p>
                <StatusPill label={STATUS_LABEL[q.status]} tone={STATUS_TONE[q.status]} />
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-graphite-500">{q.description}</p>
              <p className="mt-1 flex items-center gap-3 text-xs text-graphite-400">
                {formatDate(q.createdAt.slice(0, 10))}
                {q.files.length > 0 && <span className="flex items-center gap-1"><Paperclip size={11} /> {q.files.length}</span>}
              </p>
            </div>
            {q.estimatedPrice && <span className="shrink-0 font-display text-sm font-bold text-ink">{formatBRL(q.estimatedPrice)}</span>}
          </button>
        ))}
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-400">
            <FileText className="mx-auto mb-2 text-graphite-300" size={28} /> Nenhum orçamento recebido ainda.
          </div>
        )}
      </div>

      {selected && (
        <Modal title={`Orçamento de ${selected.name}`} onClose={() => setSelected(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-graphite-600">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-graphite-500">
              <p><strong className="text-ink">WhatsApp:</strong> {selected.whatsapp}</p>
              <p><strong className="text-ink">E-mail:</strong> {selected.email}</p>
              <p><strong className="text-ink">Quantidade:</strong> {selected.quantity}</p>
              <p><strong className="text-ink">Tamanho:</strong> {selected.approxSize}</p>
              <p><strong className="text-ink">Cor:</strong> {selected.color}</p>
              <p><strong className="text-ink">Material:</strong> {selected.material}</p>
              <p className="col-span-2"><strong className="text-ink">Prazo desejado:</strong> {selected.desiredDeadline}</p>
            </div>
            {selected.files.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-graphite-400">Arquivos</p>
                <ul className="space-y-1">
                  {selected.files.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 rounded-lg bg-graphite-100/70 px-3 py-2 text-xs text-graphite-600">
                      <Paperclip size={12} /> {f.name} · {f.sizeKb} KB
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Status</span>
              <select value={selected.status} onChange={(e) => updateQuote(selected.id, { status: e.target.value as QuoteStatus })} className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent">
                {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Valor estimado (R$)</span>
              <input type="number" value={selected.estimatedPrice ?? ""} onChange={(e) => updateQuote(selected.id, { estimatedPrice: Number(e.target.value) })} className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Notas internas</span>
              <textarea rows={3} value={selected.adminNotes ?? ""} onChange={(e) => updateQuote(selected.id, { adminNotes: e.target.value })} className="w-full resize-none rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
