"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Paperclip, Sparkles } from "lucide-react";
import { useAllQuotes } from "@/lib/admin/useAllQuotes";
import type { CustomQuote } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function ProjetosPersonalizadosPage() {
  const seedList = useAllQuotes();
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);

  useEffect(() => setQuotes(seedList), [seedList]);

  const incoming = quotes.filter((q) => q.status === "novo");

  function moveToAnalysis(id: string) {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status: "em_analise" } : q)));
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="text-accent" size={20} />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Projetos personalizados</h1>
          <p className="text-sm text-graphite-400">Fila de novas ideias enviadas pelo formulário &quot;Crie seu projeto&quot;.</p>
        </div>
      </div>

      {incoming.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-400">
          Nenhum projeto novo aguardando triagem. Veja o funil completo em{" "}
          <Link href="/admin/orcamentos" className="font-semibold text-accent">Orçamentos</Link>.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {incoming.map((q) => (
            <div key={q.id} className="rounded-2xl border border-graphite-100 bg-white p-5">
              <p className="font-display text-sm font-semibold text-ink">{q.name}</p>
              <p className="text-xs text-graphite-400">{q.whatsapp} · {formatDate(q.createdAt.slice(0, 10))}</p>
              <p className="mt-2 line-clamp-3 text-sm text-graphite-600">{q.description}</p>
              {q.files.length > 0 && (
                <p className="mt-2 flex items-center gap-1 text-xs text-graphite-400"><Paperclip size={12} /> {q.files.map((f) => f.name).join(", ")}</p>
              )}
              <button onClick={() => moveToAnalysis(q.id)} className="mt-3 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-accent">
                Mover para análise
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
