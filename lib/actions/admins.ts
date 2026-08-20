"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AddAdminState {
  ok: boolean;
  error?: string;
  email?: string;
}

const initialState: AddAdminState = { ok: false };

export async function addAdminByEmail(_prev: AddAdminState, formData: FormData): Promise<AddAdminState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: session } = await supabase.auth.getUser();
  if (!session.user) {
    return { ok: false, error: "Sessão expirada. Faça login novamente." };
  }

  const { data: requester } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (requester?.role !== "admin") {
    return { ok: false, error: "Apenas administradores podem adicionar outros administradores." };
  }

  const admin = createSupabaseAdminClient();

  const { data: existingProfile, error: lookupError } = await admin
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();
  if (lookupError) return { ok: false, error: lookupError.message };

  if (existingProfile) {
    if (existingProfile.role === "admin") {
      return { ok: false, error: "Este usuário já é administrador." };
    }
    const { error } = await admin.from("profiles").update({ role: "admin" }).eq("id", existingProfile.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, email };
  }

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteError) return { ok: false, error: inviteError.message };

  if (invited.user) {
    const { error } = await admin
      .from("profiles")
      .upsert({ id: invited.user.id, email, role: "admin", name: email.split("@")[0] });
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true, email };
}

export interface UpdateRoleState {
  ok: boolean;
  error?: string;
}

export async function updateStaffRole(
  targetId: string,
  role: "admin" | "funcionario" | "cliente"
): Promise<UpdateRoleState> {
  const supabase = await createSupabaseServerClient();
  const { data: session } = await supabase.auth.getUser();
  if (!session.user) {
    return { ok: false, error: "Sessão expirada. Faça login novamente." };
  }

  const { data: requester } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (requester?.role !== "admin") {
    return { ok: false, error: "Apenas administradores podem alterar permissões." };
  }

  if (targetId === session.user.id && role !== "admin") {
    return { ok: false, error: "Você não pode remover seu próprio acesso de administrador." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", targetId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export { initialState as addAdminInitialState };
