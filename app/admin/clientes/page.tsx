"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useAllOrders } from "@/lib/admin/useAllOrders";
import { formatBRL, formatDate } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface CustomerRow { id: string; name: string; email: string; phone: string | null; created_at: string }

export default function AdminClientesPage() {
  const orders = useAllOrders();
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerRow[]>([]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.from("profiles").select("id,name,email,phone,created_at").eq("role", "cliente").order("created_at", { ascending: false })
      .then(({ data }) => setCustomers((data ?? []) as CustomerRow[]));
  }, []);

  const rows = customers
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || (c.email ?? "").toLowerCase().includes(query.toLowerCase()))
    .map((c) => {
      const customerOrders = orders.filter((o) => o.customerEmail === c.email);
      return { ...c, ordersCount: customerOrders.length, total: customerOrders.reduce((s, o) => s + o.total, 0) };
    });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Clientes</h1>
          <p className="text-sm text-graphite-400">{customers.length} clientes cadastrados</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-graphite-200 bg-white px-3 py-2">
          <Search size={15} className="text-graphite-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente" className="w-56 text-sm outline-none" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-graphite-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite-100/60 text-xs uppercase tracking-wide text-graphite-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">Total gasto</th>
              <th className="px-4 py-3">Cliente desde</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-graphite-100 hover:bg-graphite-100/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{c.name}</p>
                </td>
                <td className="px-4 py-3 text-graphite-500">{c.email}<br /><span className="text-xs text-graphite-400">{c.phone}</span></td>
                <td className="px-4 py-3 text-graphite-500">{c.ordersCount}</td>
                <td className="px-4 py-3 font-medium text-ink">{formatBRL(c.total)}</td>
                <td className="px-4 py-3 text-graphite-400">{formatDate(c.created_at.slice(0, 10))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
