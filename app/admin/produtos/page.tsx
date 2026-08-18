"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { products as seedProducts } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { ProductPlaceholder } from "@/components/media/ProductPlaceholder";
import { Modal } from "@/components/admin/Modal";
import { ProductForm, emptyProduct } from "@/components/admin/ProductForm";

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()));

  function save(product: Product) {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev];
    });
    setEditing(null);
    setCreating(false);
  }

  function remove(id: string) {
    if (!confirm("Remover este produto?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Produtos</h1>
          <p className="text-sm text-graphite-400">{products.length} produtos cadastrados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-graphite-200 bg-white px-3 py-2">
            <Search size={15} className="text-graphite-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto ou SKU" className="w-48 text-sm outline-none" />
          </div>
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600">
            <Plus size={15} /> Novo produto
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-graphite-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite-100/60 text-xs uppercase tracking-wide text-graphite-400">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Vendidos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-graphite-100 hover:bg-graphite-100/40">
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-graphite-100">
                    <ProductPlaceholder seed={p.images[0]?.seed ?? p.slug} alt={p.name} categorySlug={p.categorySlug} className="h-full w-full" />
                  </div>
                  <div>
                    <Link href={`/produtos/${p.slug}`} target="_blank" className="line-clamp-1 font-medium text-ink hover:text-accent">{p.name}</Link>
                    <p className="text-xs text-graphite-400">{p.sku}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-graphite-500">{categories.find((c) => c.slug === p.categorySlug)?.name}</td>
                <td className="px-4 py-3 font-medium text-ink">{formatBRL(p.price)}</td>
                <td className="px-4 py-3 text-graphite-500">{p.madeToOrder ? "Sob encomenda" : p.stock}</td>
                <td className="px-4 py-3 text-graphite-500">{p.soldCount}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setEditing(p)} aria-label="Editar" className="rounded-lg p-1.5 text-graphite-500 hover:bg-graphite-100 hover:text-accent"><Pencil size={15} /></button>
                    <button onClick={() => remove(p.id)} aria-label="Remover" className="rounded-lg p-1.5 text-graphite-500 hover:bg-danger/10 hover:text-danger"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <Modal title={creating ? "Novo produto" : "Editar produto"} onClose={() => { setEditing(null); setCreating(false); }} wide>
          <ProductForm initial={editing ?? emptyProduct()} onSave={save} />
        </Modal>
      )}
    </div>
  );
}
