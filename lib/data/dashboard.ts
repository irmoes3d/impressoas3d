import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";

export function getSalesLast30Days(count = 30) {
  const days = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const weekday = date.getDay();
    const base = weekday === 0 || weekday === 6 ? 320 : 620;
    const value = Math.round(base + rand() * 480);
    days.push({ date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), vendas: value });
  }
  return days;
}

export function getCategoryBreakdown() {
  return categories
    .map((c) => ({
      name: c.name,
      vendas: products.filter((p) => p.categorySlug === c.slug).reduce((s, p) => s + p.soldCount, 0),
    }))
    .filter((c) => c.vendas > 0)
    .sort((a, b) => b.vendas - a.vendas);
}

export function getTopSellingProducts() {
  return [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 6)
    .map((p) => ({ name: p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name, vendas: p.soldCount }));
}
