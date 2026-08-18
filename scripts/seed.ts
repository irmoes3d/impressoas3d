// Popula o Supabase com os mesmos dados fictícios usados na demonstração local.
// Rode depois de aplicar supabase/schema.sql no SQL Editor do seu projeto:
//
//   npm run seed
//
// Usa a service_role key (lib/supabase/admin.ts) — nunca rode este script no
// navegador nem exponha SUPABASE_SERVICE_ROLE_KEY publicamente.

try {
  // Node 20.6+/22+/24: carrega .env.local sem depender de pacote externo.
  process.loadEnvFile(".env.local");
} catch {
  // segue com variáveis já presentes no ambiente (ex: CI)
}

import { createClient } from "@supabase/supabase-js";
import { categories } from "../lib/data/categories";
import { products } from "../lib/data/products";
import { printers } from "../lib/data/printers";
import { materials } from "../lib/data/materials";
import { coupons } from "../lib/data/coupons";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local antes de rodar o seed.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  console.log("Limpando dados antigos...");
  await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("printers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("materials").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("coupons").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("Inserindo categorias...");
  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const { data, error } = await supabase
      .from("categories")
      .insert({ slug: c.slug, name: c.name, description: c.description, icon: c.icon })
      .select("id, slug")
      .single();
    if (error) throw error;
    categoryIdBySlug.set(data.slug, data.id);
  }

  console.log("Inserindo produtos...");
  for (const p of products) {
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        category_id: categoryIdBySlug.get(p.categorySlug),
        short_description: p.shortDescription,
        description: p.description,
        material: p.material,
        weight_grams: p.weightGrams,
        dimensions: p.dimensions,
        production_days: p.productionDays,
        shipping_days: p.shippingDays,
        price: p.price,
        compare_at_price: p.compareAtPrice,
        installments: p.installments,
        stock: p.stock,
        made_to_order: p.madeToOrder,
        badge: p.badge ? p.badge.replace("-", "_") : null,
        allow_custom_name: p.allowCustomName,
        rating_avg: p.ratingAvg,
        rating_count: p.ratingCount,
        sold_count: p.soldCount,
      })
      .select("id")
      .single();
    if (error) throw error;

    if (p.images.length) {
      await supabase.from("product_images").insert(
        p.images.map((img, i) => ({ product_id: product.id, seed: img.seed, alt: img.alt, sort_order: i }))
      );
    }
    const variantRows = [
      ...(p.variants.colors ?? []).map((c, i) => ({ product_id: product.id, variant_type: "cor", name: c.name, hex: c.hex, sort_order: i })),
      ...(p.variants.sizes ?? []).map((s, i) => ({ product_id: product.id, variant_type: "tamanho", name: s.name, price_delta: s.priceDelta, sort_order: i })),
    ];
    if (variantRows.length) await supabase.from("product_variants").insert(variantRows);

    if (p.customFields.length) {
      await supabase.from("custom_fields").insert(
        p.customFields.map((f) => ({ product_id: product.id, label: f.label, field_type: f.type, required: f.required, placeholder: f.placeholder, options: f.options }))
      );
    }
  }

  console.log("Inserindo impressoras e materiais...");
  await supabase.from("printers").insert(printers.map((p) => ({ name: p.name, model: p.model, status: p.status, current_order_code: p.currentOrderCode })));
  await supabase.from("materials").insert(
    materials.map((m) => ({ type: m.type, brand: m.brand, color: m.color, weight_available_g: m.weightAvailableG, cost_per_kg: m.costPerKg, batch: m.batch, low_stock_threshold_g: m.lowStockThresholdG }))
  );
  await supabase.from("coupons").insert(
    coupons.map((c) => ({ code: c.code, type: c.type, value: c.value, min_order_value: c.minOrderValue, max_uses: c.maxUses, used_count: c.usedCount, expires_at: c.expiresAt, active: c.active }))
  );

  console.log("Criando usuário administrador de demonstração...");
  const adminEmail = "admin@2irmaosimpressoes3d.com.br";
  const adminPassword = "Admin@2Irmaos";
  const { data: existing } = await supabase.auth.admin.listUsers();
  let adminId = existing?.users.find((u) => u.email === adminEmail)?.id;

  if (!adminId) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: "Administrador 2 Irmãos" },
    });
    if (error) throw error;
    adminId = created.user?.id;
  }

  if (adminId) {
    await supabase.from("profiles").upsert({ id: adminId, name: "Administrador 2 Irmãos", email: adminEmail, role: "admin" });
    console.log(`Login do admin: ${adminEmail} / ${adminPassword}`);
  }

  console.log("Seed concluído com sucesso.");
}

main().catch((err) => {
  console.error("Erro ao rodar o seed:", err);
  process.exit(1);
});
