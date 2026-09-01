"use client";

import { useEffect, useState } from "react";
import { Download, FileWarning, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  getPrivacyOverview,
  recordPrivacyConsent,
  requestAccountDeletion,
  saveFiscalData,
} from "@/lib/actions/privacy";
import { PRIVACY_DOCUMENT_VERSION } from "@/lib/privacy";

type Overview = Awaited<ReturnType<typeof getPrivacyOverview>>;

export default function PrivacyPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [document, setDocument] = useState("");
  const [legalName, setLegalName] = useState("");
  const [stateRegistration, setStateRegistration] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const result = await getPrivacyOverview();
    setOverview(result);
    setLegalName(result.fiscal?.legalName ?? "");
    setStateRegistration(result.fiscal?.stateRegistration ?? "");
  }

  useEffect(() => { void refresh(); }, []);

  async function saveFiscal(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await saveFiscalData({ document, legalName, stateRegistration });
    setMessage(result.ok ? result.message : result.error);
    if (result.ok) { setDocument(""); await refresh(); }
    setBusy(false);
  }

  async function setConsent(purpose: "privacy_policy" | "terms_of_use" | "marketing", granted: boolean) {
    setBusy(true);
    const result = await recordPrivacyConsent({ purpose, granted });
    setMessage(result.ok ? result.message : result.error);
    await refresh();
    setBusy(false);
  }

  async function requestDeletion() {
    if (!window.confirm("Deseja solicitar a exclusão? A conta não será apagada automaticamente; a equipe revisará a solicitação.")) return;
    setBusy(true);
    const result = await requestAccountDeletion();
    setMessage(result.ok ? result.message : result.error);
    await refresh();
    setBusy(false);
  }

  if (!overview) return <p className="flex items-center gap-2 text-sm text-graphite-400"><Loader2 size={15} className="animate-spin" /> Carregando controles de privacidade...</p>;

  const latestConsent = (purpose: string) => overview.consents.find((item) => item.purpose === purpose);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-graphite-100 bg-white p-6">
        <div className="mb-4 flex items-start gap-3">
          <LockKeyhole className="mt-0.5 text-accent" size={22} />
          <div><h2 className="font-display text-lg font-semibold text-ink">Dados fiscais privados</h2><p className="text-xs text-graphite-400">Acesso exclusivo pelo backend. O documento nunca é devolvido integralmente à tela.</p></div>
        </div>
        <form onSubmit={saveFiscal} className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-graphite-400">CPF/CNPJ
            <input required value={document} onChange={(e) => setDocument(e.target.value)} placeholder={overview.fiscal?.documentMasked || "000.000.000-00"} className="mt-1.5 w-full rounded-xl border border-graphite-200 px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-accent" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-graphite-400">Nome/Razão social
            <input value={legalName} onChange={(e) => setLegalName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-graphite-200 px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-accent" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-graphite-400">Inscrição estadual
            <input value={stateRegistration} onChange={(e) => setStateRegistration(e.target.value)} className="mt-1.5 w-full rounded-xl border border-graphite-200 px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-accent" />
          </label>
          <button disabled={busy} className="self-end rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Salvar dados fiscais</button>
        </form>
      </section>

      <section className="rounded-2xl border border-graphite-100 bg-white p-6">
        <div className="mb-4 flex items-center gap-2"><ShieldCheck className="text-ok" size={20} /><h2 className="font-display text-lg font-semibold text-ink">Consentimentos</h2></div>
        <p className="mb-4 text-xs text-graphite-400">Versão vigente: {PRIVACY_DOCUMENT_VERSION}. Cada alteração gera um registro histórico.</p>
        <div className="space-y-3 text-sm">
          <ConsentRow label="Política de privacidade" state={latestConsent("privacy_policy")?.granted} onAccept={() => setConsent("privacy_policy", true)} disabled={busy} />
          <ConsentRow label="Termos de uso" state={latestConsent("terms_of_use")?.granted} onAccept={() => setConsent("terms_of_use", true)} disabled={busy} />
          <ConsentRow label="Comunicações de marketing" state={latestConsent("marketing")?.granted} onAccept={() => setConsent("marketing", true)} onReject={() => setConsent("marketing", false)} disabled={busy} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <a href="/api/account/data-export" className="rounded-2xl border border-graphite-100 bg-white p-6 hover:border-accent">
          <Download className="mb-3 text-accent" size={22} /><h2 className="font-display font-semibold text-ink">Exportar meus dados</h2><p className="mt-1 text-xs text-graphite-400">Baixa um JSON gerado na hora, sem arquivo persistente.</p>
        </a>
        <button onClick={requestDeletion} disabled={busy} className="rounded-2xl border border-danger/20 bg-white p-6 text-left hover:border-danger disabled:opacity-50">
          <FileWarning className="mb-3 text-danger" size={22} /><h2 className="font-display font-semibold text-ink">Solicitar exclusão</h2><p className="mt-1 text-xs text-graphite-400">Cria uma solicitação revisável antes da anonimização.</p>
        </button>
      </section>

      {overview.requests.length > 0 && <section className="rounded-2xl border border-graphite-100 bg-white p-6"><h2 className="mb-3 font-display font-semibold text-ink">Solicitações recentes</h2><div className="space-y-2 text-xs">{overview.requests.map((request) => <div key={request.id} className="flex justify-between rounded-xl bg-graphite-100/60 px-3 py-2"><span>{request.request_type === "export" ? "Exportação" : "Exclusão"}</span><strong>{request.status}</strong></div>)}</div></section>}
      {message && <p role="status" className="rounded-xl bg-accent-100/50 px-4 py-3 text-sm text-graphite-700">{message}</p>}
    </div>
  );
}

function ConsentRow({ label, state, onAccept, onReject, disabled }: { label: string; state?: boolean; onAccept: () => void; onReject?: () => void; disabled: boolean }) {
  return <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-graphite-100/50 px-3 py-2.5"><span>{label}</span><div className="flex items-center gap-2"><span className={state === true ? "text-ok" : state === false ? "text-danger" : "text-graphite-400"}>{state === true ? "Aceito" : state === false ? "Recusado" : "Não registrado"}</span><button onClick={onAccept} disabled={disabled} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">Aceitar</button>{onReject && <button onClick={onReject} disabled={disabled} className="rounded-full border border-graphite-200 px-3 py-1 text-xs">Recusar</button>}</div></div>;
}
