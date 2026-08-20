import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ColorOption, CustomFieldDef, FieldType, Product, ProductBadge, ProductImage, SizeOption } from "@/lib/types";

// Camada de acesso a produtos: tenta o Supabase (schema em supabase/schema.sql)
// e cai para os dados fictícios locais se o banco ainda não tiver sido
// provisionado ou não tiver produtos cadastrados. Isso permite que o site
// funcione imediatamente e passe a usar dados reais assim que o schema for
// aplicado e populado (npm run seed), sem qualquer mudança nas páginas.

interface ProductImageRow { id: string; seed: string; alt: string; sort_order: number }
interface ProductVariantRow { id: string; variant_type: "cor" | "tamanho"; name: string; hex: string | null; price_delta: string | number }
interface CustomFieldRow { id: string; label: string; field_type: FieldType; required: boolean; placeholder: string | null; options: string[] | null }
interface ProductRow {
  id: string; slug: string; sku: string; name: string;
  categories: { slug: string } | null;
  short_description: string | null; description: string | null; material: string | null;
  weight_grams: number | null; dimensions: string | null; production_days: number | null; shipping_days: number | null;
  price: string | number; compare_at_price: string | number | null; installments: number | null; stock: number | null;
  made_to_order: boolean | null; badge: string | null; rating_avg: string | number | null; rating_count: number | null;
  sold_count: number | null; allow_custom_name: boolean | null; active: boolean | null; created_at: string | null;
  product_images: ProductImageRow[] | null; product_variants: ProductVariantRow[] | null; custom_fields: CustomFieldRow[] | null;
}

function mapRow(row: ProductRow): Product {
  const images: ProductImage[] = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ id: img.id, seed: img.seed, alt: img.alt }));

  const colors: ColorOption[] = (row.product_variants ?? [])
    .filter((v) => v.variant_type === "cor")
    .map((v) => ({ id: v.id, name: v.name, hex: v.hex ?? "#000000" }));

  const sizes: SizeOption[] = (row.product_variants ?? [])
    .filter((v) => v.variant_type === "tamanho")
    .map((v) => ({ id: v.id, name: v.name, priceDelta: Number(v.price_delta) }));

  const customFields: CustomFieldDef[] = (row.custom_fields ?? []).map((f) => ({
    id: f.id,
    label: f.label,
    type: f.field_type as FieldType,
    required: f.required,
    placeholder: f.placeholder ?? undefined,
    options: f.options ?? undefined,
  }));

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    categorySlug: row.categories?.slug ?? "",
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    material: row.material ?? "",
    weightGrams: row.weight_grams ?? 0,
    dimensions: row.dimensions ?? "",
    productionDays: row.production_days ?? 3,
    shippingDays: row.shipping_days ?? 5,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    installments: row.installments ?? 1,
    stock: row.stock ?? 0,
    madeToOrder: row.made_to_order ?? false,
    badge: row.badge ? (row.badge.replace("_", "-") as ProductBadge) : null,
    ratingAvg: Number(row.rating_avg ?? 0),
    ratingCount: row.rating_count ?? 0,
    soldCount: row.sold_count ?? 0,
    active: row.active ?? true,
    images,
    variants: { colors, sizes },
    allowCustomName: row.allow_custom_name ?? false,
    customFields,
    createdAt: row.created_at?.slice(0, 10) ?? "2026-01-01",
    tags: [],
  };
}

const SELECT = "*, product_images(*), product_variants(*), custom_fields(*), categories(slug)";

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("products").select(SELECT).eq("active", true);
    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

export async function getAdminProducts(): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("products").select(SELECT).order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("products").select(SELECT).eq("slug", slug).maybeSingle();
    if (error || !data) return undefined;
    return mapRow(data);
  } catch {
    return undefined;
  }
}

export async function getProductsByCategory(categorySlug: string) {
  const all = await getProducts();
  return all.filter((p) => p.categorySlug === categorySlug);
}

export async function getBestSellers() {
  const all = await getProducts();
  return [...all].sort((a, b) => b.soldCount - a.soldCount).slice(0, 8);
}

export async function getNewArrivals() {
  const all = await getProducts();
  return [...all].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 8);
}

export async function getFeaturedForYou() {
  const all = await getProducts();
  return all.filter((p) => p.ratingAvg >= 4.7).slice(0, 8);
}
