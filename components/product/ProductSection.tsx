import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductSection({
  title,
  subtitle,
  products,
  href,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
}) {
  return (
    <section className="container-page py-12 lg:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink lg:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-graphite-400">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-accent hover:text-accent-600 sm:inline-flex">
            Ver todos <ArrowRight size={15} />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {href && (
        <Link href={href} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent sm:hidden">
          Ver todos <ArrowRight size={15} />
        </Link>
      )}
    </section>
  );
}
