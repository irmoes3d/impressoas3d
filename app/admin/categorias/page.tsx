"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { categories as seedCategories } from "@/lib/data/categories";
import type { Category } from "@/lib/types";
import { Modal } from "@/components/admin/Modal";

function emptyCategory(): Category {
  return { id: crypto.randomUUID(), slug: "", name: "", description: "", icon: "sparkles" };
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [editing, setEditing] = useState<Category | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const slug = editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = { ...editing, slug };
    setCategories((prev) => (prev.some((c) => c.id === category.id) ? prev.map((c) => (c.id === category.id ? category : c)) : [category, ...prev]));
    setEditing(null);
  }

  function remove(id: string) {
    if (!confirm("Remover esta categoria?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Categorias</h1>
          <p className="text-sm text-graphite-400">{categories.length} categorias</p>
        </div>
        <button onClick={() => setEditing(emptyCategory())} className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600">
          <Plus size={15} /> Nova categoria
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl border border-graphite-100 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-ink">{c.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => setEditing(c)} className="rounded-lg p-1 text-graphite-400 hover:text-accent"><Pencil size={14} /></button>
                <button onClick={() => remove(c.id)} className="rounded-lg p-1 text-graphite-400 hover:text-danger"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-xs text-graphite-400">/{c.slug}</p>
            <p className="mt-2 text-sm text-graphite-500">{c.description}</p>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={categories.some((c) => c.id === editing.id) ? "Editar categoria" : "Nova categoria"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <input required placeholder="Nome" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
            <input placeholder="URL amigável (slug)" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
            <textarea placeholder="Descrição" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full resize-none rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
            <button type="submit" className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white">Salvar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
