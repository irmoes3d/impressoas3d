import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, categories } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/repo/products";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <div className="container-page py-10">
      <nav className="mb-4 text-xs text-graphite-400">
        <Link href="/categorias" className="hover:text-accent">Categorias</Link> / <span className="text-graphite-600">{category.name}</span>
      </nav>
      <h1 className="font-display text-3xl font-bold text-ink">{category.name}</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-graphite-400">{category.description}</p>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-graphite-200 py-20 text-center text-graphite-400">
          Em breve novos produtos nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-2">
        {categories.filter((c) => c.slug !== slug).map((c) => (
          <Link key={c.id} href={`/categorias/${c.slug}`} className="rounded-full border border-graphite-200 px-3.5 py-1.5 text-xs font-medium text-graphite-600 hover:border-accent hover:text-accent">
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
