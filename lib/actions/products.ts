"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminProducts } from "@/lib/repo/products";
import type { Product } from "@/lib/types";

export interface ProductActionResult {
  ok: boolean;
  error?: string;
  product?: Product;
}

async function getStaffClient() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Faça login como administrador para salvar alterações." } as const;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "funcionario") {
    return { error: "Sua conta não tem permissão para gerenciar produtos." } as const;
  }
  return { supabase } as const;
}

export async function loadAdminProducts() {
  return getAdminProducts();
}

export async function saveProduct(product: Product): Promise<ProductActionResult> {
  const access = await getStaffClient();
  if ("error" in access) return { ok: false, error: access.error };
  const { supabase } = access;

  const { data: category } = await supabase.from("categories").select("id").eq("slug", product.categorySlug).maybeSingle();
  if (!category) return { ok: false, error: "Categoria não encontrada no banco de dados." };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id);
  const row = {
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    category_id: category.id,
    short_description: product.shortDescription,
    description: product.description,
    material: product.material,
    weight_grams: product.weightGrams,
    dimensions: product.dimensions,
    production_days: product.productionDays,
    shipping_days: product.shippingDays,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    installments: product.installments,
    stock: product.stock,
    made_to_order: product.madeToOrder,
    badge: product.badge?.replace("-", "_") ?? null,
    allow_custom_name: product.allowCustomName,
    active: product.active ?? true,
  };

  const query = isUuid
    ? supabase.from("products").upsert({ id: product.id, ...row }).select("id").single()
    : supabase.from("products").insert(row).select("id").single();
  const { data: saved, error } = await query;
  if (error || !saved) return { ok: false, error: error?.message ?? "Não foi possível salvar o produto." };

  const productId = saved.id as string;
  const childTables = ["product_images", "product_variants", "custom_fields"] as const;
  for (const table of childTables) {
    const { error: deleteError } = await supabase.from(table).delete().eq("product_id", productId);
    if (deleteError) return { ok: false, error: deleteError.message };
  }

  if (product.images.length) {
    const { error: imageError } = await supabase.from("product_images").insert(product.images.map((image, index) => ({ product_id: productId, seed: image.seed, alt: image.alt, sort_order: index })));
    if (imageError) return { ok: false, error: imageError.message };
  }
  const variants = [
    ...(product.variants.colors ?? []).map((variant, index) => ({ product_id: productId, variant_type: "cor", name: variant.name, hex: variant.hex, price_delta: 0, sort_order: index })),
    ...(product.variants.sizes ?? []).map((variant, index) => ({ product_id: productId, variant_type: "tamanho", name: variant.name, hex: null, price_delta: variant.priceDelta, sort_order: index })),
  ];
  if (variants.length) {
    const { error: variantError } = await supabase.from("product_variants").insert(variants);
    if (variantError) return { ok: false, error: variantError.message };
  }
  if (product.customFields.length) {
    const { error: fieldError } = await supabase.from("custom_fields").insert(product.customFields.map((field) => ({ product_id: productId, label: field.label, field_type: field.type, required: field.required, placeholder: field.placeholder ?? null, options: field.options ?? null })));
    if (fieldError) return { ok: false, error: fieldError.message };
  }

  revalidateCatalog(product.slug);
  return { ok: true, product: { ...product, id: productId } };
}

export async function setProductActive(id: string, active: boolean): Promise<ProductActionResult> {
  const access = await getStaffClient();
  if ("error" in access) return { ok: false, error: access.error };
  const { error } = await access.supabase.from("products").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCatalog();
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  const access = await getStaffClient();
  if ("error" in access) return { ok: false, error: access.error };
  const { error } = await access.supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCatalog();
  return { ok: true };
}

function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath("/categorias", "layout");
  revalidatePath("/admin/produtos");
  if (slug) revalidatePath(`/produtos/${slug}`);
}
