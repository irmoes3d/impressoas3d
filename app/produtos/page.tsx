import type { Metadata } from "next";
import { getProducts } from "@/lib/repo/products";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { MobileFilterDrawer } from "@/components/catalog/MobileFilterDrawer";
import { SortSelect } from "@/components/catalog/SortSelect";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Catálogo completo de produtos impressos em 3D: decoração, geek, games, presentes, utilidades e muito mais.",
};

function parseList(value?: string) {
  return (value ?? "").split(",").filter(Boolean);
}

function filterProducts(all: Product[], sp: Record<string, string | undefined>) {
  let list = [...all];

  const categorias = parseList(sp.categoria);
  if (categorias.length) list = list.filter((p) => categorias.includes(p.categorySlug));

  const cores = parseList(sp.cor);
  if (cores.length) list = list.filter((p) => p.variants.colors?.some((c) => cores.includes(c.name)));

  const materiais = parseList(sp.material);
  if (materiais.length) list = list.filter((p) => materiais.includes(p.material));

  const tamanhos = parseList(sp.tamanho);
  if (tamanhos.length) list = list.filter((p) => p.variants.sizes?.some((s) => tamanhos.includes(s.name)));

  if (sp.precoMax) list = list.filter((p) => p.price <= Number(sp.precoMax));

  const disponibilidade = parseList(sp.disponibilidade);
  if (disponibilidade.length) {
    list = list.filter((p) => {
      const pronta = !p.madeToOrder && p.stock > 0;
      const encomenda = p.madeToOrder;
      return (disponibilidade.includes("pronta-entrega") && pronta) || (disponibilidade.includes("sob-encomenda") && encomenda);
    });
  }

  if (sp.personalizados === "1") {
    list = list.filter((p) => p.allowCustomName || p.customFields.length > 0 || p.variants.allowCustomColor);
  }

  if (sp.busca) {
    const q = sp.busca.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)) || p.shortDescription.toLowerCase().includes(q)
    );
  }

  const sorters: Record<string, (a: Product, b: Product) => number> = {
    vendidos: (a, b) => b.soldCount - a.soldCount,
    "menor-preco": (a, b) => a.price - b.price,
    "maior-preco": (a, b) => b.price - a.price,
    novidades: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
    avaliados: (a, b) => b.ratingAvg - a.ratingAvg,
  };
  const sorter = sorters[sp.ordenar ?? "vendidos"] ?? sorters.vendidos;
  return list.sort(sorter);
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const all = await getProducts();
  const list = filterProducts(all, sp);

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">Produtos</h1>
        <p className="mt-1 text-sm text-graphite-400">
          {sp.busca ? `Resultados para "${sp.busca}" · ` : ""}
          {list.length} {list.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>

        <div className="flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <MobileFilterDrawer>
              <FilterSidebar />
            </MobileFilterDrawer>
            <div className="ml-auto">
              <SortSelect />
            </div>
          </div>

          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-graphite-200 py-20 text-center text-graphite-400">
              Nenhum produto encontrado com esses filtros. Tente ajustar sua busca.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
