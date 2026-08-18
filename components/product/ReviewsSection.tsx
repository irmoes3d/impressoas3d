"use client";

import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import type { Review } from "@/lib/types";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ReviewsSection({ productId, initialReviews }: { productId: string; initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const review: Review = {
      id: crypto.randomUUID(),
      productId,
      customerName: name || "Cliente",
      rating: rating as 1 | 2 | 3 | 4 | 5,
      comment,
      verifiedPurchase: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("reviews").insert({
        product_id: productId,
        customer_name: review.customerName,
        rating: review.rating,
        comment: review.comment,
      });
    } catch {
      // banco ainda não provisionado: mantemos a avaliação apenas na sessão
    }

    setReviews((prev) => [review, ...prev]);
    setSent(true);
    setOpen(false);
    setName("");
    setComment("");
    setRating(5);
  }

  return (
    <div className="mt-16 border-t border-graphite-100 pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Avaliações</h2>
          <div className="mt-1.5 flex items-center gap-2">
            <RatingStars value={avg} size={16} />
            <span className="text-sm text-graphite-500">{avg.toFixed(1)} de 5 · {reviews.length} avaliações</span>
          </div>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink hover:text-white">
          Avaliar produto
        </button>
      </div>

      {sent && (
        <p className="mb-6 flex items-center gap-2 rounded-xl bg-ok/10 px-4 py-3 text-sm text-ok">
          <CheckCircle2 size={16} /> Avaliação enviada! Obrigado por compartilhar sua experiência.
        </p>
      )}

      {open && (
        <form onSubmit={submit} className="mb-8 space-y-3 rounded-2xl border border-graphite-100 bg-graphite-100/40 p-5">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button type="button" key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} estrelas`}>
                <Star size={22} className={i < rating ? "fill-sun text-sun" : "text-graphite-200"} />
              </button>
            ))}
          </div>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Conte como foi sua experiência com o produto"
            className="w-full resize-none rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
            Enviar avaliação
          </button>
        </form>
      )}

      <div className="space-y-6">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-graphite-100 pb-6 last:border-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 font-display text-sm font-bold text-accent">
                {r.customerName.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{r.customerName}</p>
                <p className="text-xs text-graphite-400">{formatDate(r.createdAt)}</p>
              </div>
              {r.verifiedPurchase && (
                <span className="ml-auto flex items-center gap-1 rounded-full bg-ok/10 px-2.5 py-1 text-[11px] font-semibold text-ok">
                  <CheckCircle2 size={12} /> Compra verificada
                </span>
              )}
            </div>
            <div className="mt-2">
              <RatingStars value={r.rating} />
            </div>
            <p className="mt-1.5 text-sm text-graphite-600">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
