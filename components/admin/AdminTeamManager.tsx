"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, ShieldOff, UserCog, UserPlus, XCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/context/AuthContext";
import { addAdminByEmail, addAdminInitialState, updateStaffRole } from "@/lib/actions/admins";

interface StaffProfile {
  id: string;
  name: string;
  email: string | null;
  role: "admin" | "funcionario" | "cliente";
}

export function AdminTeamManager() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowError, setRowError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(addAdminByEmail, addAdminInitialState);

  async function loadStaff() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .in("role", ["admin", "funcionario"])
      .order("role");
    setStaff((data as StaffProfile[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (state.ok) loadStaff();
  }, [state]);

  async function changeRole(target: StaffProfile, role: "admin" | "funcionario" | "cliente") {
    setRowError(null);
    setPendingId(target.id);
    const result = await updateStaffRole(target.id, role);
    if (!result.ok) setRowError(result.error ?? "Não foi possível alterar a permissão.");
    else await loadStaff();
    setPendingId(null);
  }

  const adminCount = staff.filter((s) => s.role === "admin").length;
  const staffCount = staff.filter((s) => s.role === "funcionario").length;

  return (
    <div className="space-y-4 rounded-2xl border border-graphite-100 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Administradores</h2>
          <p className="mt-1 text-xs text-graphite-400">
            Adicione outro administrador pelo e-mail. Se a pessoa já tiver conta na loja, o perfil dela vira
            admin na hora; caso contrário enviamos um convite por e-mail (requer SMTP configurado no Supabase).
          </p>
        </div>
        <div className="flex shrink-0 gap-4 text-xs text-graphite-500">
          <span><strong className="text-ink">{adminCount}</strong> admin{adminCount === 1 ? "" : "s"}</span>
          <span><strong className="text-ink">{staffCount}</strong> funcionário{staffCount === 1 ? "" : "s"}</span>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        <input
          required
          type="email"
          name="email"
          placeholder="email@exemplo.com"
          className="w-full flex-1 rounded-xl border border-graphite-200 px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-600 disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Adicionar
        </button>
      </form>

      {state.error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-danger">
          <XCircle size={13} /> {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-ok">
          <CheckCircle2 size={13} /> {state.email} agora é administrador.
        </p>
      )}
      {rowError && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-danger">
          <XCircle size={13} /> {rowError}
        </p>
      )}

      <div className="space-y-1.5 pt-2">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-graphite-400">
          Equipe atual
        </span>
        {loading && <p className="text-xs text-graphite-400">Carregando...</p>}
        {!loading && staff.length === 0 && (
          <p className="text-xs text-graphite-400">Nenhum admin/funcionário cadastrado ainda (ou banco não provisionado).</p>
        )}
        {staff.map((s) => {
          const isSelf = s.id === user?.id;
          const isPending = pendingId === s.id;
          return (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-graphite-100/60 px-4 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{s.name || s.email} {isSelf && <span className="text-graphite-400">(você)</span>}</p>
                <p className="truncate text-xs text-graphite-400">{s.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                  <ShieldCheck size={13} /> {s.role === "admin" ? "Admin" : "Funcionário"}
                </span>
                {!isSelf && (
                  <>
                    {s.role === "funcionario" ? (
                      <button
                        onClick={() => changeRole(s, "admin")}
                        disabled={isPending}
                        className="flex items-center gap-1 rounded-full border border-graphite-200 px-3 py-1 text-[11px] font-semibold text-graphite-600 hover:border-accent hover:text-accent disabled:opacity-50"
                      >
                        <UserCog size={12} /> Tornar admin
                      </button>
                    ) : (
                      <button
                        onClick={() => changeRole(s, "funcionario")}
                        disabled={isPending}
                        className="flex items-center gap-1 rounded-full border border-graphite-200 px-3 py-1 text-[11px] font-semibold text-graphite-600 hover:border-accent hover:text-accent disabled:opacity-50"
                      >
                        <UserCog size={12} /> Rebaixar
                      </button>
                    )}
                    <button
                      onClick={() => changeRole(s, "cliente")}
                      disabled={isPending}
                      className="flex items-center gap-1 rounded-full border border-danger/30 px-3 py-1 text-[11px] font-semibold text-danger hover:bg-danger/10 disabled:opacity-50"
                    >
                      <ShieldOff size={12} /> Remover acesso
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
