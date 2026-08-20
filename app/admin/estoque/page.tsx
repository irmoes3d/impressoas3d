"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/format";

interface MaterialRow { id: string; type: string; brand: string; color: string; weight_available_g: number; cost_per_kg: number; batch: string | null; low_stock_threshold_g: number }
interface ProductRow { id: string; name: string; weight_grams: number; material: string; price: number }

export default function EstoquePage() {
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [losses, setLosses] = useState<Array<{ id: string; description: string; quantity_pieces: number; weight_g: number; cost: number }>>([]);
  const [form, setForm] = useState({ materialId: "", productId: "", description: "", pieces: "1", weight: "" });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    Promise.all([
      supabase.from("materials").select("*").order("type"),
      supabase.from("products").select("id,name,weight_grams,material,price").eq("active", true).order("name"),
      supabase.from("production_losses").select("id,description,quantity_pieces,weight_g,cost").order("created_at", { ascending: false }),
    ]).then(([materialsResult, productsResult, lossesResult]) => {
      setMaterials((materialsResult.data ?? []).map((item) => ({ ...item, weight_available_g: Number(item.weight_available_g), cost_per_kg: Number(item.cost_per_kg), low_stock_threshold_g: Number(item.low_stock_threshold_g) })));
      setProducts((productsResult.data ?? []).map((item) => ({ ...item, weight_grams: Number(item.weight_grams), price: Number(item.price) })));
      setLosses((lossesResult.data ?? []).map((item) => ({ ...item, weight_g: Number(item.weight_g), cost: Number(item.cost) })));
    });
  }, []);

  async function registerLoss(e: React.FormEvent) {
    e.preventDefault();
    const material = materials.find((item) => item.id === form.materialId);
    const weight = Number(form.weight);
    const cost = material ? (weight / 1000) * material.cost_per_kg : 0;
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("production_losses").insert({ material_id: form.materialId || null, product_id: form.productId || null, description: form.description, quantity_pieces: Number(form.pieces), weight_g: weight, cost }).select("id,description,quantity_pieces,weight_g,cost").single();
    if (!data) return;
    if (material) {
      const nextWeight = Math.max(0, material.weight_available_g - weight);
      await supabase.from("materials").update({ weight_available_g: nextWeight }).eq("id", material.id);
      await supabase.from("inventory").insert({ material_id: material.id, movement_type: "saida", quantity_g: weight, reason: `Perda: ${form.description}` });
      setMaterials((current) => current.map((item) => item.id === material.id ? { ...item, weight_available_g: nextWeight } : item));
    }
    setLosses((current) => [{ ...data, weight_g: Number(data.weight_g), cost: Number(data.cost) }, ...current]);
    setForm({ materialId: "", productId: "", description: "", pieces: "1", weight: "" });
  }

  return <div className="space-y-8">
    <div><h1 className="font-display text-2xl font-bold text-ink">Estoque e perdas</h1><p className="text-sm text-graphite-400">Controle de filamentos, custo por peça e falhas de produção.</p></div>
    <section><h2 className="mb-4 font-display text-lg font-bold">Filamentos</h2><div className="overflow-x-auto rounded-2xl border border-graphite-100 bg-white"><table className="w-full text-left text-sm"><thead className="bg-graphite-100/60 text-xs uppercase text-graphite-400"><tr><th className="px-4 py-3">Material</th><th className="px-4 py-3">Marca / cor</th><th className="px-4 py-3">Disponível</th><th className="px-4 py-3">Custo/kg</th><th className="px-4 py-3">Valor em estoque</th></tr></thead><tbody>{materials.map((item) => { const low = item.weight_available_g <= item.low_stock_threshold_g; return <tr key={item.id} className="border-t border-graphite-100"><td className="px-4 py-3 font-medium">{item.type}</td><td className="px-4 py-3 text-graphite-500">{item.brand} · {item.color}</td><td className={`px-4 py-3 ${low ? "font-semibold text-danger" : ""}`}>{low && <AlertTriangle size={13} className="mr-1 inline" />}{item.weight_available_g}g</td><td className="px-4 py-3">{formatBRL(item.cost_per_kg)}</td><td className="px-4 py-3 font-medium">{formatBRL((item.weight_available_g / 1000) * item.cost_per_kg)}</td></tr>})}{materials.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-graphite-400">Nenhum filamento cadastrado.</td></tr>}</tbody></table></div></section>
    <section className="grid gap-6 xl:grid-cols-2"><div className="rounded-2xl border border-graphite-100 bg-white p-5"><h2 className="mb-4 font-display text-lg font-bold">Custo de material por peça</h2><div className="space-y-2">{products.map((product) => { const material = materials.find((item) => product.material.toLowerCase().includes(item.type.toLowerCase())); const cost = material ? (product.weight_grams / 1000) * material.cost_per_kg : 0; return <div key={product.id} className="flex items-center justify-between rounded-xl bg-graphite-100/50 px-3 py-2 text-xs"><div><strong>{product.name}</strong><p className="text-graphite-400">{product.weight_grams}g · venda {formatBRL(product.price)}</p></div><strong className="text-accent">{formatBRL(cost)}/peça</strong></div>})}</div></div>
      <form onSubmit={registerLoss} className="rounded-2xl border border-graphite-100 bg-white p-5"><h2 className="mb-4 font-display text-lg font-bold">Registrar perda de peça</h2><div className="grid gap-3 sm:grid-cols-2"><select required value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value })} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm"><option value="">Filamento utilizado</option>{materials.map((item) => <option key={item.id} value={item.id}>{item.type} · {item.color}</option>)}</select><select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm"><option value="">Produto (opcional)</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Motivo da perda" className="rounded-xl border border-graphite-200 px-3 py-2 text-sm sm:col-span-2" /><input required type="number" min="1" value={form.pieces} onChange={(e) => setForm({ ...form, pieces: e.target.value })} placeholder="Peças" className="rounded-xl border border-graphite-200 px-3 py-2 text-sm" /><input required type="number" min="0.01" step="0.01" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="Peso perdido (g)" className="rounded-xl border border-graphite-200 px-3 py-2 text-sm" /><button className="flex items-center justify-center gap-2 rounded-xl bg-danger py-2 text-sm font-semibold text-white sm:col-span-2"><Plus size={15} /> Registrar e baixar estoque</button></div><div className="mt-4 space-y-2">{losses.slice(0, 4).map((item) => <div key={item.id} className="flex justify-between text-xs"><span>{item.description} · {item.quantity_pieces} peça(s) · {item.weight_g}g</span><strong className="text-danger">{formatBRL(item.cost)}</strong></div>)}</div></form>
    </section>
  </div>;
}
