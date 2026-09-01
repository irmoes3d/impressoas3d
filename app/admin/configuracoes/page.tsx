"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { SupabaseKeepAlive } from "@/components/admin/SupabaseKeepAlive";
import { DEFAULT_SETTINGS, getStoredSettings, saveStoredSettings, type StoreSettings } from "@/lib/settings-store";
import { sendAdminEmailTest } from "@/lib/actions/admin-orders";

const INTEGRATIONS = [
  { name: "Supabase (banco de dados e autenticação)", envVar: "NEXT_PUBLIC_SUPABASE_URL" },
  { name: "Mercado Pago (pagamentos)", envVar: "MERCADO_PAGO_ACCESS_TOKEN" },
  { name: "Melhor Envio (frete)", envVar: "MELHOR_ENVIO_TOKEN" },
  { name: "Correios (rastreamento)", envVar: "CORREIOS_TOKEN" },
];

export default function AdminConfiguracoesPage() {
  const [form, setForm] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [emailTest, setEmailTest] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  useEffect(() => {
    setForm(getStoredSettings());
  }, []);

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    saveStoredSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Configurações</h1>
        <p className="text-sm text-graphite-400">Dados de contato e integrações da loja.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-graphite-100 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Dados da loja e contato</h2>
          <F label="Nome da loja"><input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} className="input" /></F>
          <F label="E-mail de contato"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" /></F>
          <F label="Número do WhatsApp (com DDI e DDD, só dígitos)"><input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="input" placeholder="5511999999999" /></F>
          <F label="Instagram"><input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className="input" placeholder="@usuario" /></F>
          <F label="Endereço / região de atendimento"><input value={form.address} onChange={(e) => set("address", e.target.value)} className="input" /></F>
          <F label="Horário de atendimento"><input value={form.businessHours} onChange={(e) => set("businessHours", e.target.value)} className="input" /></F>
          <F label="CNPJ (opcional)"><input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} className="input" placeholder="00.000.000/0001-00" /></F>
          <button type="submit" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-600">Salvar</button>
          {saved && (
            <p className="flex items-center gap-1.5 text-sm text-ok">
              <CheckCircle2 size={15} /> Configurações salvas. O site já reflete os novos dados.
            </p>
          )}
          <style jsx>{`
            .input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--graphite-200); padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
            .input:focus { border-color: var(--accent); }
          `}</style>
        </form>

        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-graphite-100 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Integrações</h2>
            <p className="text-xs text-graphite-400">
              Status das integrações configuradas via variáveis de ambiente (.env.local). Nunca cole
              chaves secretas diretamente na interface.
            </p>
            <div className="space-y-2">
              {INTEGRATIONS.map((i, idx) => {
                const connected = idx === 0 ? supabaseConfigured : false;
                return (
                  <div key={i.name} className="flex items-center justify-between rounded-xl bg-graphite-100/60 px-4 py-3 text-sm">
                    <span className="text-graphite-700">{i.name}</span>
                    {connected ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-ok"><CheckCircle2 size={14} /> Conectado</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-graphite-400"><XCircle size={14} /> Não configurado</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-graphite-100 pt-4">
              <button
                type="button"
                disabled={emailTest === "sending"}
                onClick={async () => {
                  setEmailTest("sending");
                  const result = await sendAdminEmailTest();
                  setEmailTest(result.ok ? "sent" : "error");
                }}
                className="rounded-full border border-accent px-4 py-2 text-xs font-semibold text-accent disabled:opacity-50"
              >
                {emailTest === "sending" ? "Enviando..." : "Enviar e-mail de teste"}
              </button>
              {emailTest === "sent" && <p className="mt-2 text-xs text-ok">Teste enviado para irmoes3d@outlook.com.</p>}
              {emailTest === "error" && <p className="mt-2 text-xs text-danger">Não foi possível enviar. Confira as variáveis e o domínio no Resend.</p>}
            </div>
          </div>

          <SupabaseKeepAlive />
        </div>
      </div>
    </div>
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
