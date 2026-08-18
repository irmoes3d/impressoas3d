import type { MetadataRoute } from "next";
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";

const BASE = "https://2irmaosimpressoes3d.com.br";

const STATIC_ROUTES = [
  "", "produtos", "categorias", "personalizados", "como-funciona", "sobre", "contato",
  "galeria", "empresas", "carrinho", "politica-de-privacidade", "termos-de-uso",
  "trocas-e-devolucoes", "politica-de-envio",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${BASE}/${route}`,
    lastModified: new Date(),
  }));

  const productEntries = products.map((p) => ({
    url: `${BASE}/produtos/${p.slug}`,
    lastModified: p.createdAt,
  }));

  const categoryEntries = categories.map((c) => ({
    url: `${BASE}/categorias/${c.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
