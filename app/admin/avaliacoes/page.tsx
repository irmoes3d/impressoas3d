"use client";

import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { reviews as seedReviews } from "@/lib/data/reviews";
import { products } from "@/lib/data/products";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/lib/format";

export default function AdminAvaliacoesPage() {
  const [reviews, setReviews] = useState(seedReviews.map((r) => ({ ...r, approved: true })));

  function toggle(id: string, approved: boolean) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)));
  }
  function remove(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Avaliações</h1>
        <p className="text-sm text-graphite-400">Modere os comentários enviados pelos clientes.</p>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => {
          const product = products.find((p) => p.id === r.productId);
          return (
            <div key={r.id} className={`flex items-start justify-between rounded-2xl border p-5 ${r.approved ? "border-graphite-100 bg-white" : "border-danger/30 bg-danger/5"}`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{r.customerName}</p>
                  <RatingStars value={r.rating} />
                  <span className="text-xs text-graphite-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-graphite-400">Produto: {product?.name}</p>
                <p className="mt-2 text-sm text-graphite-600">{r.comment}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {r.approved ? (
                  <button onClick={() => toggle(r.id, false)} aria-label="Reprovar" className="rounded-lg p-2 text-graphite-400 hover:bg-danger/10 hover:text-danger"><X size={16} /></button>
                ) : (
                  <button onClick={() => toggle(r.id, true)} aria-label="Aprovar" className="rounded-lg p-2 text-graphite-400 hover:bg-ok/10 hover:text-ok"><Check size={16} /></button>
                )}
                <button onClick={() => remove(r.id)} aria-label="Excluir" className="rounded-lg p-2 text-graphite-400 hover:bg-graphite-100"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
