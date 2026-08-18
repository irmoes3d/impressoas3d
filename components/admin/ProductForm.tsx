"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ColorOption, CustomFieldDef, FieldType, Product, ProductBadge } from "@/lib/types";
import { categories } from "@/lib/data/categories";

export function emptyProduct(): Product {
  return {
    id: crypto.randomUUID(),
    slug: "",
    sku: "",
    name: "",
    categorySlug: categories[0].slug,
    shortDescription: "",
    description: "",
    material: "PLA+",
    weightGrams: 50,
    dimensions: "",
    productionDays: 3,
    shippingDays: 5,
    price: 0,
    installments: 1,
    stock: 10,
    madeToOrder: false,
    badge: null,
    ratingAvg: 0,
    ratingCount: 0,
    soldCount: 0,
    images: [{ id: crypto.randomUUID(), seed: "novo-produto", alt: "Novo produto" }],
    variants: { colors: [] },
    allowCustomName: false,
    customFields: [],
    createdAt: new Date().toISOString().slice(0, 10),
    tags: [],
  };
}

const FIELD_TYPES: FieldType[] = ["texto", "numero", "data", "cor", "upload", "observacoes"];

export function ProductForm({ initial, onSave }: { initial: Product; onSave: (p: Product) => void }) {
  const [product, setProduct] = useState<Product>(initial);

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setProduct((p) => ({ ...p, [key]: value }));
  }

  function addColor() {
    const color: ColorOption = { id: crypto.randomUUID(), name: "Nova cor", hex: "#2f5bff" };
    set("variants", { ...product.variants, colors: [...(product.variants.colors ?? []), color] });
  }

  function updateColor(id: string, patch: Partial<ColorOption>) {
    set("variants", { ...product.variants, colors: product.variants.colors?.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }

  function removeColor(id: string) {
    set("variants", { ...product.variants, colors: product.variants.colors?.filter((c) => c.id !== id) });
  }

  function addField() {
    const field: CustomFieldDef = { id: crypto.randomUUID(), label: "Novo campo", type: "texto", required: false };
    set("customFields", [...product.customFields, field]);
  }

  function updateField(id: string, patch: Partial<CustomFieldDef>) {
    set("customFields", product.customFields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeField(id: string) {
    set("customFields", product.customFields.filter((f) => f.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = product.slug || product.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    onSave({ ...product, slug });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Nome"><input required value={product.name} onChange={(e) => set("name", e.target.value)} className="input" /></F>
        <F label="SKU"><input required value={product.sku} onChange={(e) => set("sku", e.target.value)} className="input" /></F>
        <F label="Categoria">
          <select value={product.categorySlug} onChange={(e) => set("categorySlug", e.target.value)} className="input">
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </F>
        <F label="Selo">
          <select value={product.badge ?? ""} onChange={(e) => set("badge", (e.target.value || null) as ProductBadge)} className="input">
            <option value="">Nenhum</option>
            <option value="mais-vendido">Mais vendido</option>
            <option value="novo">Novo</option>
            <option value="oferta">Oferta</option>
          </select>
        </F>
      </div>

      <F label="Descrição curta"><input value={product.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className="input" /></F>
      <F label="Descrição completa"><textarea rows={3} value={product.description} onChange={(e) => set("description", e.target.value)} className="input resize-none" /></F>

      <div className="grid gap-4 sm:grid-cols-3">
        <F label="Preço (R$)"><input required type="number" step="0.01" value={product.price} onChange={(e) => set("price", Number(e.target.value))} className="input" /></F>
        <F label="Preço promocional"><input type="number" step="0.01" value={product.compareAtPrice ?? ""} onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : undefined)} className="input" /></F>
        <F label="Parcelas"><input type="number" min={1} value={product.installments} onChange={(e) => set("installments", Number(e.target.value))} className="input" /></F>
        <F label="Material"><input value={product.material} onChange={(e) => set("material", e.target.value)} className="input" /></F>
        <F label="Peso (g)"><input type="number" value={product.weightGrams} onChange={(e) => set("weightGrams", Number(e.target.value))} className="input" /></F>
        <F label="Dimensões"><input value={product.dimensions} onChange={(e) => set("dimensions", e.target.value)} className="input" placeholder="Ex: 10x10x5 cm" /></F>
        <F label="Produção (dias)"><input type="number" value={product.productionDays} onChange={(e) => set("productionDays", Number(e.target.value))} className="input" /></F>
        <F label="Estoque"><input type="number" value={product.stock} onChange={(e) => set("stock", Number(e.target.value))} className="input" disabled={product.madeToOrder} /></F>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-graphite-600">
          <input type="checkbox" checked={product.madeToOrder} onChange={(e) => set("madeToOrder", e.target.checked)} className="accent-accent" /> Sob encomenda
        </label>
        <label className="flex items-center gap-2 text-sm text-graphite-600">
          <input type="checkbox" checked={product.allowCustomName} onChange={(e) => set("allowCustomName", e.target.checked)} className="accent-accent" /> Permite nome personalizado
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-graphite-400">Variações de cor</span>
          <button type="button" onClick={addColor} className="flex items-center gap-1 text-xs font-semibold text-accent"><Plus size={13} /> Adicionar cor</button>
        </div>
        <div className="space-y-2">
          {product.variants.colors?.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <input type="color" value={c.hex} onChange={(e) => updateColor(c.id, { hex: e.target.value })} className="h-9 w-9 rounded-lg border border-graphite-200" />
              <input value={c.name} onChange={(e) => updateColor(c.id, { name: e.target.value })} className="input flex-1" />
              <button type="button" onClick={() => removeColor(c.id)} className="text-graphite-300 hover:text-danger"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-graphite-400">Campos personalizados</span>
          <button type="button" onClick={addField} className="flex items-center gap-1 text-xs font-semibold text-accent"><Plus size={13} /> Adicionar campo</button>
        </div>
        <div className="space-y-2">
          {product.customFields.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <input value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })} className="input flex-1" placeholder="Rótulo" />
              <select value={f.type} onChange={(e) => updateField(f.id, { type: e.target.value as FieldType })} className="input w-32">
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="flex items-center gap-1 text-xs text-graphite-500">
                <input type="checkbox" checked={f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })} className="accent-accent" /> obrigatório
              </label>
              <button type="button" onClick={() => removeField(f.id)} className="text-graphite-300 hover:text-danger"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-white hover:bg-accent-600">
        Salvar produto
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--graphite-200);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: var(--accent);
        }
      `}</style>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">{label}</span>
      {children}
    </label>
  );
}
