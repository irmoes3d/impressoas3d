import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { ProductSection } from "@/components/product/ProductSection";
import { categories } from "@/lib/data/categories";
import { getBestSellers, getFeaturedForYou, getNewArrivals } from "@/lib/repo/products";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const [bestSellers, newArrivals, featured] = await Promise.all([
    getBestSellers(),
    getNewArrivals(),
    getFeaturedForYou(),
  ]);

  return (
    <>
      <Hero />
      <Highlights />

      <section className="container-page py-12 lg:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink lg:text-3xl">Categorias</h2>
            <p className="mt-1 text-sm text-graphite-400">Encontre exatamente o que você procura.</p>
          </div>
          <Link href="/categorias" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-accent sm:inline-flex">
            Ver todas <ArrowRight size={15} />
          </Link>
        </div>
        <CategoryGrid categories={categories.slice(0, 10)} />
      </section>

      <ProductSection title="Mais vendidos" subtitle="Os favoritos de quem já comprou com a gente." products={bestSellers} href="/produtos?ordenar=vendidos" />

      <div className="bg-graphite-100/50">
        <ProductSection title="Novidades" subtitle="Acabou de sair da impressora." products={newArrivals} href="/produtos?ordenar=novidades" />
      </div>

      <ProductSection title="Feitos especialmente para você" subtitle="Selecionados pela avaliação e qualidade." products={featured} href="/produtos" />

      <HowItWorks />
    </>
  );
}
