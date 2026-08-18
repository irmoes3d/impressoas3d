"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductPlaceholder } from "@/components/media/ProductPlaceholder";
import { ProductBadgePill } from "@/components/ui/ProductBadge";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatBRL, formatInstallments } from "@/lib/format";
import { useFavorites } from "@/lib/context/FavoritesContext";
import { useCart } from "@/lib/context/CartContext";
import { getCategoryBySlug } from "@/lib/data/categories";

export function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggle } = useFavorites();
  const { addItem } = useCart();
  const category = getCategoryBySlug(product.categorySlug);
  const fav = isFavorite(product.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-graphite-100 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-graphite-200/40">
      <Link href={`/produtos/${product.slug}`} className="relative block aspect-square overflow-hidden bg-graphite-100">
        <ProductPlaceholder
          seed={product.images[0]?.seed ?? product.slug}
          alt={product.name}
          categorySlug={product.categorySlug}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <ProductBadgePill badge={product.badge} />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:scale-105"
        >
          <Heart size={16} className={fav ? "fill-danger text-danger" : ""} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-medium uppercase tracking-wide text-graphite-400">
          {category?.name}
        </span>
        <Link href={`/produtos/${product.slug}`} className="line-clamp-2 font-display text-sm font-semibold text-ink hover:text-accent">
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <RatingStars value={product.ratingAvg} />
          <span className="text-xs text-graphite-400">({product.ratingCount})</span>
        </div>

        <div className="mt-1">
          {product.compareAtPrice && (
            <span className="mr-2 text-xs text-graphite-400 line-through">
              {formatBRL(product.compareAtPrice)}
            </span>
          )}
          <span className="font-display text-lg font-bold text-ink">{formatBRL(product.price)}</span>
          <p className="text-xs text-graphite-400">{formatInstallments(product.price, product.installments)}</p>
        </div>

        <button
          type="button"
          onClick={() =>
            addItem({
              productId: product.id,
              productSlug: product.slug,
              name: product.name,
              imageSeed: product.images[0]?.seed ?? product.slug,
              unitPrice: product.price,
              quantity: 1,
              customization: {},
            })
          }
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-accent"
        >
          <ShoppingCart size={15} /> Comprar
        </button>
      </div>
    </div>
  );
}
