"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { getStoredQuotes } from "@/lib/quotes-store";
import type { CustomQuote } from "@/lib/types";
import { formatDate } from "@/lib/format";

const STATUS_LABEL: Record<CustomQuote["status"], string> = {
  novo: "Recebido",
  em_analise: "Em análise",
  orcamento_enviado: "Orçamento enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

export default function OrcamentosPage() {
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);

  useEffect(() => setQuotes(getStoredQuotes()), []);

  if (quotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-500">
        <FileText className="mx-auto mb-2 text-graphite-300" size={28} />
        Você ainda não solicitou nenhum orçamento personalizado.
        <Link href="/personalizados" className="mt-3 block text-sm font-semibold text-accent">Criar meu projeto →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quotes.map((q) => (
        <div key={q.id} className="rounded-2xl border border-graphite-100 p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-ink">{formatDate(q.createdAt.slice(0, 10))}</p>
            <span className="rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-semibold text-accent">{STATUS_LABEL[q.status]}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-graphite-600">{q.description}</p>
          {q.files.length > 0 && <p className="mt-1 text-xs text-graphite-400">{q.files.length} arquivo(s) anexado(s)</p>}
        </div>
      ))}
    </div>
  );
}
