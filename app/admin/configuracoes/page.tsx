"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const INTEGRATIONS = [
  { name: "Supabase (banco de dados e autenticação)", envVar: "NEXT_PUBLIC_SUPABASE_URL" },
  { name: "Mercado Pago (pagamentos)", envVar: "MERCADO_PAGO_ACCESS_TOKEN" },
  { name: "Melhor Envio (frete)", envVar: "MELHOR_ENVIO_TOKEN" },
  { name: "Correios (rastreamento)", envVar: "CORREIOS_TOKEN" },
];

export default function AdminConfiguracoesPage() {
  const [whatsapp, setWhatsapp] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999");
  const [storeName, setStoreName] = useState("2 Irmãos Impressões 3D");
  const [email, setEmail] = useState("contato@2irmaosimpressoes3d.com.br");
  const [instagram, setInstagram] = useState("@2irmaosimpressoes3d");
  const [saved, setSaved] = useState(false);

  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-graphite-100 bg-white p-6">
        <h1 className="font-display text-lg font-semibold text-ink">Dados da loja</h1>
        <F label="Nome da loja"><input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="input" /></F>
        <F label="Número do WhatsApp (com DDI e DDD)"><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="input" placeholder="5511999999999" /></F>
        <F label="E-mail de contato"><input value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></F>
        <F label="Instagram"><input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="input" /></F>
        <button type="submit" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-600">Salvar</button>
        {saved && <p className="text-sm text-ok">Configurações salvas.</p>}
        <style jsx>{`
          .input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--graphite-200); padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
          .input:focus { border-color: var(--accent); }
        `}</style>
      </form>

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
