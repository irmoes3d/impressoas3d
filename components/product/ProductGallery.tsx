"use client";

import { useRef, useState } from "react";
import { ProductPlaceholder } from "@/components/media/ProductPlaceholder";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, categorySlug, name }: { images: ProductImage[]; categorySlug: string; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  const img = images[active];

  return (
    <div>
      <div
        ref={frameRef}
        onMouseMove={handleMove}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-graphite-100"
      >
        <ProductPlaceholder
          seed={img.seed}
          alt={img.alt}
          categorySlug={categorySlug}
          className="h-full w-full transition-transform duration-150 ease-out"
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: zooming ? "scale(1.9)" : "scale(1)",
          }}
          key={img.id}
        />
      </div>
      <p className="mt-1.5 text-center text-xs text-graphite-400 lg:hidden">Toque e arraste para ampliar no desktop</p>

      <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
        {images.map((image, i) => (
          <button
            key={image.id}
            onClick={() => setActive(i)}
            aria-label={`Ver foto ${i + 1} de ${name}`}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
              i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <ProductPlaceholder seed={image.seed} alt={image.alt} categorySlug={categorySlug} className="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
