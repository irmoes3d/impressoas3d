"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/context/FavoritesContext";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export default function FavoritosPage() {
  const { ids } = useFavorites();
  const items = products.filter((p) => ids.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-500">
        <Heart className="mx-auto mb-2 text-graphite-300" size={28} />
        Você ainda não favoritou nenhum produto.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
