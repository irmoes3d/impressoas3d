"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { coupons as seedCoupons } from "@/lib/data/coupons";
import type { Coupon } from "@/lib/types";
import { formatBRL, formatDate } from "@/lib/format";
import { Modal } from "@/components/admin/Modal";
import { StatusPill } from "@/components/admin/StatusPill";

function emptyCoupon(): Coupon {
  return { id: crypto.randomUUID(), code: "", type: "percentual", value: 10, minOrderValue: 0, maxUses: 100, usedCount: 0, expiresAt: new Date().toISOString().slice(0, 10), active: true };
}

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(seedCoupons);
  const [editing, setEditing] = useState<Coupon | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const coupon = { ...editing, code: editing.code.toUpperCase() };
    setCoupons((prev) => (prev.some((c) => c.id === coupon.id) ? prev.map((c) => (c.id === coupon.id ? coupon : c)) : [coupon, ...prev]));
    setEditing(null);
  }

  function remove(id: string) {
    if (!confirm("Remover este cupom?")) return;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Cupons</h1>
          <p className="text-sm text-graphite-400">{coupons.length} cupons cadastrados</p>
        </div>
        <button onClick={() => setEditing(emptyCoupon())} className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600">
          <Plus size={15} /> Novo cupom
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-graphite-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite-100/60 text-xs uppercase tracking-wide text-graphite-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Mínimo</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-graphite-100 hover:bg-graphite-100/40">
                <td className="px-4 py-3 font-mono text-xs font-bold text-ink">{c.code}</td>
                <td className="px-4 py-3 text-graphite-600">{c.type === "percentual" ? `${c.value}%` : formatBRL(c.value)}</td>
                <td className="px-4 py-3 text-graphite-500">{formatBRL(c.minOrderValue)}</td>
                <td className="px-4 py-3 text-graphite-500">{c.usedCount}/{c.maxUses}</td>
                <td className="px-4 py-3 text-graphite-400">{formatDate(c.expiresAt)}</td>
                <td className="px-4 py-3"><StatusPill label={c.active ? "Ativo" : "Inativo"} tone={c.active ? "ok" : "neutral"} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-graphite-500 hover:text-accent"><Pencil size={15} /></button>
                    <button onClick={() => remove(c.id)} className="rounded-lg p-1.5 text-graphite-500 hover:text-danger"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Cupom" onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <input required placeholder="Código" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
            <div className="grid grid-cols-2 gap-3">
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as Coupon["type"] })} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent">
                <option value="percentual">Percentual</option>
                <option value="fixo">Valor fixo</option>
              </select>
              <input required type="number" placeholder="Valor" value={editing.value} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Pedido mínimo" value={editing.minOrderValue} onChange={(e) => setEditing({ ...editing, minOrderValue: Number(e.target.value) })} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
              <input type="number" placeholder="Usos máximos" value={editing.maxUses} onChange={(e) => setEditing({ ...editing, maxUses: Number(e.target.value) })} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
            </div>
            <input type="date" value={editing.expiresAt} onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })} className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
            <label className="flex items-center gap-2 text-sm text-graphite-600">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="accent-accent" /> Ativo
            </label>
            <button type="submit" className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white">Salvar cupom</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
