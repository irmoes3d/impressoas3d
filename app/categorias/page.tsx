import type { Metadata } from "next";
import { categories } from "@/lib/data/categories";
import { CategoryGrid } from "@/components/category/CategoryGrid";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Explore todas as categorias de produtos impressos em 3D da 2 Irmãos Impressões 3D.",
};

export default function CategoriasPage() {
  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-bold text-ink">Categorias</h1>
      <p className="mt-1 mb-8 text-sm text-graphite-400">Encontre exatamente o que você procura.</p>
      <CategoryGrid categories={categories} />
    </div>
  );
}
