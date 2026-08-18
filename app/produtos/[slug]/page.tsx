import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Clock, PackageCheck, Ruler, Truck, Weight } from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/repo/products";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getReviewsByProduct } from "@/lib/data/reviews";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { ProductSection } from "@/components/product/ProductSection";
import { formatBRL } from "@/lib/format";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { title: product.name, description: product.shortDescription },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.categorySlug);
  const reviews = getReviewsByProduct(product.id);
  const all = await getProducts();
  const related = all.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDescription,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    },
    aggregateRating: product.ratingCount
      ? { "@type": "AggregateRating", ratingValue: product.ratingAvg, reviewCount: product.ratingCount }
      : undefined,
  };

  return (
    <div className="container-page py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-graphite-400">
        <Link href="/" className="hover:text-accent">Início</Link> /
        <Link href="/produtos" className="hover:text-accent">Produtos</Link> /
        <Link href={`/categorias/${category?.slug}`} className="hover:text-accent">{category?.name}</Link> /
        <span className="text-graphite-600">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} categorySlug={product.categorySlug} name={product.name} />

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">{category?.name}</span>
          <h1 className="mt-1.5 font-display text-2xl font-bold text-ink lg:text-3xl">{product.name}</h1>
          <p className="mt-1 text-xs text-graphite-400">SKU: {product.sku}</p>
          <p className="mt-3 text-sm text-graphite-600">{product.shortDescription}</p>

          <div className="mt-6">
            <PurchasePanel product={product} />
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Descrição</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-graphite-600">{product.description}</p>
        </div>

        <div className="h-fit space-y-4 rounded-2xl border border-graphite-100 bg-graphite-100/40 p-5">
          <InfoRow icon={Box} label="Material" value={product.material} />
          <InfoRow icon={Ruler} label="Dimensões" value={product.dimensions} />
          <InfoRow icon={Weight} label="Peso" value={`${product.weightGrams} g`} />
          <InfoRow icon={Clock} label="Produção" value={`${product.productionDays} dias úteis`} />
          <InfoRow icon={Truck} label="Envio estimado" value={`${product.shippingDays} dias úteis após produção`} />
          <InfoRow
            icon={PackageCheck}
            label="Estoque"
            value={product.madeToOrder ? "Sob encomenda" : `${product.stock} unidades disponíveis`}
          />
          {product.compareAtPrice && (
            <p className="rounded-lg bg-sun-100 px-3 py-2 text-xs font-medium text-sun">
              Economize {formatBRL(product.compareAtPrice - product.price)} nesta oferta
            </p>
          )}
        </div>
      </div>

      <ReviewsSection productId={product.id} initialReviews={reviews} />

      {related.length > 0 && (
        <div className="-mx-5 mt-4 lg:-mx-8">
          <ProductSection title="Você também pode gostar" products={related} />
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Box; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-accent" strokeWidth={1.8} />
      <div>
        <p className="text-xs text-graphite-400">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}
