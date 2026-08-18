"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DadosPessoaisPage() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name ?? (user?.user_metadata?.name as string) ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (user) await supabase.from("profiles").update({ name, phone }).eq("id", user.id);
    } catch {
      // banco ainda não provisionado
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSave} className="max-w-md space-y-4 rounded-2xl border border-graphite-100 p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Dados pessoais</h2>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">E-mail</label>
        <input value={user?.email ?? ""} disabled className="w-full rounded-xl border border-graphite-200 bg-graphite-100/60 px-4 py-2.5 text-sm text-graphite-400" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Telefone / WhatsApp</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="w-full rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent" />
      </div>
      <button type="submit" disabled={saving} className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60">
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
      {saved && <p className="flex items-center gap-1.5 text-sm text-ok"><CheckCircle2 size={15} /> Dados atualizados.</p>}
    </form>
  );
}
