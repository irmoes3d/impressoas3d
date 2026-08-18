"use client";

import { useState } from "react";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import type { Address } from "@/lib/types";
import { useAuth } from "@/lib/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function EnderecosPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: "Casa", cep: "", street: "", number: "", district: "", city: "", state: "" });

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    const address: Address = { id: crypto.randomUUID(), isDefault: addresses.length === 0, ...form };
    setAddresses((prev) => [...prev, address]);
    setOpen(false);
    setForm({ label: "Casa", cep: "", street: "", number: "", district: "", city: "", state: "" });
    try {
      const supabase = createSupabaseBrowserClient();
      if (user) await supabase.from("addresses").insert({ profile_id: user.id, ...toSnake(address) });
    } catch {
      // banco ainda não provisionado
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Endereços</h2>
        <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
          <Plus size={15} /> Novo endereço
        </button>
      </div>

      {open && (
        <form onSubmit={addAddress} className="mb-6 grid gap-3 rounded-2xl border border-graphite-100 bg-graphite-100/40 p-5 sm:grid-cols-2">
          <input required placeholder="Apelido (Casa, Trabalho...)" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2" />
          <input required placeholder="CEP" value={form.cep} onChange={(e) => setForm((f) => ({ ...f, cep: e.target.value }))} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
          <input required placeholder="Número" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
          <input required placeholder="Rua" value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2" />
          <input required placeholder="Bairro" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
          <input required placeholder="Cidade" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
          <input required placeholder="UF" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent" />
          <button type="submit" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white sm:col-span-2">Salvar endereço</button>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-graphite-200 p-10 text-center text-sm text-graphite-500">
          <MapPin className="mx-auto mb-2 text-graphite-300" size={28} />
          Nenhum endereço cadastrado ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start justify-between rounded-2xl border border-graphite-100 p-5">
              <div>
                <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                  {a.label} {a.isDefault && <span className="flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-medium text-accent"><Star size={10} /> padrão</span>}
                </p>
                <p className="mt-1 text-sm text-graphite-500">{a.street}, {a.number} · {a.district} · {a.city}/{a.state} · {a.cep}</p>
              </div>
              <button onClick={() => setAddresses((prev) => prev.filter((x) => x.id !== a.id))} aria-label="Remover endereço" className="text-graphite-300 hover:text-danger">
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function toSnake(a: Address) {
  return { label: a.label, cep: a.cep, street: a.street, number: a.number, district: a.district, city: a.city, state: a.state, is_default: a.isDefault };
}
