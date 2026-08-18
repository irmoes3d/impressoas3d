"use client";

import { useState } from "react";
import { ProductPlaceholder } from "@/components/media/ProductPlaceholder";
import { galleryCategories, galleryItems } from "@/lib/data/gallery";

export function GalleryMasonry() {
  const [filter, setFilter] = useState<string>("todos");
  const items = filter === "todos" ? galleryItems : galleryItems.filter((i) => i.category === filter);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {galleryCategories.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              filter === c.value ? "border-ink bg-ink text-white" : "border-graphite-200 text-graphite-600 hover:border-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {items.map((item) => (
          <div key={item.id} className="break-inside-avoid overflow-hidden rounded-2xl bg-graphite-100" style={{ aspectRatio: item.ratio }}>
            <ProductPlaceholder seed={item.seed} alt={item.alt} className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
