import { products } from "@/lib/data/products";

export function getFilterOptions() {
  const colors = new Map<string, string>();
  const materials = new Set<string>();
  const sizes = new Set<string>();

  for (const p of products) {
    p.variants.colors?.forEach((c) => colors.set(c.name, c.hex));
    materials.add(p.material);
    p.variants.sizes?.forEach((s) => sizes.add(s.name));
  }

  return {
    colors: Array.from(colors.entries()).map(([name, hex]) => ({ name, hex })),
    materials: Array.from(materials),
    sizes: Array.from(sizes),
    maxPrice: Math.ceil(Math.max(...products.map((p) => p.price)) / 10) * 10,
  };
}
