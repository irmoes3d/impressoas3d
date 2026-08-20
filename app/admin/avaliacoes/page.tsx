"use client";

import { useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import type { Review } from "@/lib/types";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminAvaliacoesPage() {
  const [reviews, setReviews] = useState<Array<Review & { approved: boolean }>>([]);

  useEffect(() => {
    createSupabaseBrowserClient().from("reviews").select("*").order("created_at", { ascending: false }).then(({ data }) => setReviews((data ?? []).map((item) => ({ id: item.id, productId: item.product_id, customerName: item.customer_name, rating: item.rating as Review["rating"], comment: item.comment, verifiedPurchase: item.verified_purchase, createdAt: item.created_at, photoSeed: item.photo_seed ?? undefined, approved: item.approved }))));
  }, []);

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
          return (
            <div key={r.id} className={`flex items-start justify-between rounded-2xl border p-5 ${r.approved ? "border-graphite-100 bg-white" : "border-danger/30 bg-danger/5"}`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{r.customerName}</p>
                  <RatingStars value={r.rating} />
                  <span className="text-xs text-graphite-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-graphite-400">Produto: {r.productId}</p>
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
