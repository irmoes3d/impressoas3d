"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileBox, ImageIcon, Loader2, RefreshCw, Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface OrderFile { id: string; file_kind: "modelo_3d" | "previa"; name: string; storage_path: string; url?: string }
interface Approval { id: string; status: "aguardando" | "aprovado" | "ajuste_solicitado"; customer_comment: string | null }

export function DesignApprovalPanel({ orderId, staff = false }: { orderId: string; staff?: boolean }) {
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [approval, setApproval] = useState<Approval | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function load() {
    const [{ data: fileRows }, { data: approvalRow }] = await Promise.all([
      supabase.from("order_files").select("id,file_kind,name,storage_path").eq("order_id", orderId).order("created_at"),
      supabase.from("design_approvals").select("id,status,customer_comment").eq("order_id", orderId).maybeSingle(),
    ]);
    const signed = await Promise.all(((fileRows ?? []) as OrderFile[]).map(async (file) => {
      const { data } = await supabase.storage.from("order-files").createSignedUrl(file.storage_path, 3600);
      return { ...file, url: data?.signedUrl };
    }));
    setFiles(signed); setApproval(approvalRow as Approval | null);
  }

  // A troca do pedido é o único evento que deve recarregar os arquivos.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [orderId]);

  async function upload(file: File) {
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const kind = staff ? "previa" : "modelo_3d";
    const path = `${orderId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await supabase.storage.from("order-files").upload(path, file);
    if (!error) {
      const { data: row } = await supabase.from("order_files").insert({ order_id: orderId, uploaded_by: auth.user?.id, file_kind: kind, name: file.name, storage_path: path }).select("id").single();
      if (staff && row) await supabase.from("design_approvals").upsert({ order_id: orderId, preview_file_id: row.id, status: "aguardando", customer_comment: null, responded_at: null }, { onConflict: "order_id" });
      await load();
    }
    setBusy(false);
  }

  async function respond(status: "aprovado" | "ajuste_solicitado") {
    setBusy(true);
    await supabase.from("design_approvals").update({ status, customer_comment: comment || null, responded_at: new Date().toISOString() }).eq("order_id", orderId);
    await load(); setBusy(false);
  }

  const models = files.filter((file) => file.file_kind === "modelo_3d");
  const previews = files.filter((file) => file.file_kind === "previa");
  return <section className="rounded-2xl border border-graphite-100 bg-white p-5">
    <div className="mb-4"><h2 className="font-display text-sm font-semibold text-ink">Arquivo e aprovação</h2><p className="mt-1 text-xs text-graphite-400">{staff ? "Envie a prévia para o cliente aprovar antes da impressão." : "Envie seu STL/3MF/OBJ ou aprove a prévia preparada pela equipe."}</p></div>
    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-accent/40 bg-accent-100/30 px-4 py-3 text-xs font-semibold text-accent hover:bg-accent-100">
      {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} {staff ? "Publicar foto da prévia" : "Anexar arquivo 3D"}
      <input type="file" className="hidden" accept={staff ? "image/png,image/jpeg,image/webp" : ".stl,.3mf,.obj,.step,.stp,application/octet-stream"} disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); }} />
    </label>
    {models.length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-semibold text-graphite-500">Modelo enviado pelo cliente</p>{models.map((file) => <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-graphite-100 px-3 py-2 text-xs text-graphite-600"><FileBox size={14} /> {file.name}</a>)}</div>}
    {previews.length > 0 && <div className="mt-4 space-y-3"><p className="text-xs font-semibold text-graphite-500">Prévia para aprovação</p>{previews.slice(-1).map((file) => <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-graphite-100">{file.url ? <img src={file.url} alt="Prévia do projeto" className="max-h-72 w-full object-contain" /> : <span className="flex p-4"><ImageIcon /></span>}</a>)}
      {approval && <div className={`rounded-xl px-3 py-2 text-xs font-semibold ${approval.status === "aprovado" ? "bg-ok/10 text-ok" : approval.status === "ajuste_solicitado" ? "bg-sun-100 text-sun" : "bg-accent-100 text-accent"}`}>{approval.status === "aprovado" ? "Prévia aprovada para impressão" : approval.status === "ajuste_solicitado" ? `Ajuste solicitado${approval.customer_comment ? `: ${approval.customer_comment}` : ""}` : "Aguardando aprovação do cliente"}</div>}
      {!staff && approval?.status === "aguardando" && <div className="space-y-2"><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Observação ou ajuste necessário" rows={2} className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-xs outline-none focus:border-accent" /><div className="flex gap-2"><button onClick={() => respond("aprovado")} disabled={busy} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-ok px-3 py-2 text-xs font-semibold text-white"><CheckCircle2 size={14} /> Aprovar</button><button onClick={() => respond("ajuste_solicitado")} disabled={busy} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-sun px-3 py-2 text-xs font-semibold text-white"><RefreshCw size={14} /> Pedir ajuste</button></div></div>}
    </div>}
  </section>;
}
