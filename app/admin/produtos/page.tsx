"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { products as seedProducts } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { ProductPlaceholder } from "@/components/media/ProductPlaceholder";
import { Modal } from "@/components/admin/Modal";
import { ProductForm, emptyProduct } from "@/components/admin/ProductForm";
import { deleteProduct, loadAdminProducts, saveProduct, setProductActive } from "@/lib/actions/products";

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    loadAdminProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()));

  function save(product: Product) {
    startTransition(async () => {
      setFeedback(null);
      const result = await saveProduct(product);
      if (!result.ok || !result.product) {
        setFeedback({ tone: "error", message: result.error ?? "Não foi possível salvar o produto." });
        return;
      }
      const saved = result.product;
      setProducts((prev) => prev.some((item) => item.id === product.id)
        ? prev.map((item) => item.id === product.id ? saved : item)
        : [saved, ...prev]);
      setEditing(null);
      setCreating(false);
      setFeedback({ tone: "ok", message: `${saved.name} foi salvo e o catálogo já foi atualizado.` });
    });
  }

  function remove(id: string) {
    const product = products.find((item) => item.id === id);
    if (!confirm(`Excluir ${product?.name ?? "este produto"}? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result.ok) return setFeedback({ tone: "error", message: result.error ?? "Não foi possível excluir." });
      setProducts((prev) => prev.filter((item) => item.id !== id));
      setFeedback({ tone: "ok", message: "Produto excluído do catálogo." });
    });
  }

  function toggleActive(product: Product) {
    const active = !(product.active ?? true);
    startTransition(async () => {
      const result = await setProductActive(product.id, active);
      if (!result.ok) return setFeedback({ tone: "error", message: result.error ?? "Não foi possível alterar a visibilidade." });
      setProducts((prev) => prev.map((item) => item.id === product.id ? { ...item, active } : item));
      setFeedback({ tone: "ok", message: active ? "Produto publicado na loja." : "Produto ocultado da loja." });
    });
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

      {feedback && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${feedback.tone === "ok" ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"}`}>
          {feedback.tone === "ok" ? <CheckCircle2 size={16} /> : null}{feedback.message}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-graphite-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite-100/60 text-xs uppercase tracking-wide text-graphite-400">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Vendidos</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className={`border-t border-graphite-100 hover:bg-graphite-100/40 ${p.active === false ? "opacity-60" : ""}`}>
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
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.active === false ? "bg-graphite-100 text-graphite-500" : "bg-ok/10 text-ok"}`}>{p.active === false ? "Oculto" : "Publicado"}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => toggleActive(p)} disabled={pending} aria-label={p.active === false ? "Publicar" : "Ocultar"} title={p.active === false ? "Publicar na loja" : "Ocultar da loja"} className="rounded-lg p-1.5 text-graphite-500 hover:bg-graphite-100 hover:text-accent">{p.active === false ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                    <button onClick={() => setEditing(p)} aria-label="Editar" className="rounded-lg p-1.5 text-graphite-500 hover:bg-graphite-100 hover:text-accent"><Pencil size={15} /></button>
                    <button onClick={() => remove(p.id)} aria-label="Remover" className="rounded-lg p-1.5 text-graphite-500 hover:bg-danger/10 hover:text-danger"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {loading && <tr><td colSpan={7} className="py-16 text-center text-graphite-400"><Loader2 className="mx-auto animate-spin" /></td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} className="py-16 text-center text-sm text-graphite-400">Nenhum produto encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <Modal title={creating ? "Novo produto" : "Editar produto"} onClose={() => { setEditing(null); setCreating(false); }} wide>
          <ProductForm initial={editing ?? emptyProduct()} onSave={save} saving={pending} />
        </Modal>
      )}
    </div>
  );
}
