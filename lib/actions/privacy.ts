"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PRIVACY_DOCUMENT_VERSION } from "@/lib/privacy";

type ActionResult = { ok: true; message: string } | { ok: false; error: string };

async function requireUser() {
  const client = await createSupabaseServerClient();
  const { data } = await client.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Faça login novamente.");
  return data.user;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function hasValidCheckDigits(value: string) {
  const digits = onlyDigits(value);
  if (/^(\d)\1+$/.test(digits)) return false;
  if (digits.length === 11) {
    const calc = (length: number) => {
      let sum = 0;
      for (let index = 0; index < length; index++) sum += Number(digits[index]) * (length + 1 - index);
      const result = (sum * 10) % 11;
      return result === 10 ? 0 : result;
    };
    return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
  }
  if (digits.length === 14) {
    const calc = (length: number) => {
      let factor = length - 7;
      let sum = 0;
      for (let index = 0; index < length; index++) {
        sum += Number(digits[index]) * factor--;
        if (factor < 2) factor = 9;
      }
      const result = sum % 11;
      return result < 2 ? 0 : 11 - result;
    };
    return calc(12) === Number(digits[12]) && calc(13) === Number(digits[13]);
  }
  return false;
}

async function fingerprint() {
  const requestHeaders = await headers();
  const input = `${requestHeaders.get("user-agent") ?? ""}|${requestHeaders.get("accept-language") ?? ""}`;
  return createHash("sha256").update(input).digest("hex");
}

async function audit(actorId: string, action: string, targetTable: string, targetId?: string) {
  await createSupabaseAdminClient().from("admin_audit_logs").insert({
    actor_profile_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
  });
}

export async function getPrivacyOverview() {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const [{ data: fiscal }, { data: consents }, { data: requests }] = await Promise.all([
    admin.from("customer_private_data")
      .select("document_last_digits, legal_name, state_registration, retention_until")
      .eq("profile_id", user.id).maybeSingle(),
    admin.from("privacy_consents")
      .select("purpose, document_version, granted, created_at")
      .eq("profile_id", user.id).order("created_at", { ascending: false }).limit(20),
    admin.from("data_subject_requests")
      .select("id, request_type, status, requested_at, completed_at")
      .eq("profile_id", user.id).order("requested_at", { ascending: false }).limit(10),
  ]);
  return {
    fiscal: fiscal ? {
      documentMasked: fiscal.document_last_digits ? `***.***.***-${fiscal.document_last_digits}` : "",
      legalName: fiscal.legal_name ?? "",
      stateRegistration: fiscal.state_registration ?? "",
      retentionUntil: fiscal.retention_until ?? "",
    } : null,
    consents: consents ?? [],
    requests: requests ?? [],
  };
}

export async function saveFiscalData(input: {
  document: string;
  legalName?: string;
  stateRegistration?: string;
}): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const document = onlyDigits(input.document);
    if (!hasValidCheckDigits(document)) return { ok: false, error: "CPF/CNPJ inválido." };
    const legalName = input.legalName?.trim().slice(0, 180) || null;
    const stateRegistration = input.stateRegistration?.trim().slice(0, 40) || null;
    const retentionUntil = new Date();
    retentionUntil.setFullYear(retentionUntil.getFullYear() + 5);
    const { error } = await createSupabaseAdminClient().from("customer_private_data").upsert({
      profile_id: user.id,
      document,
      document_last_digits: document.slice(-2),
      legal_name: legalName,
      state_registration: stateRegistration,
      retention_until: retentionUntil.toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, error: "Não foi possível salvar os dados fiscais." };
    await audit(user.id, "update_own_fiscal_data", "customer_private_data", user.id);
    revalidatePath("/conta/privacidade");
    return { ok: true, message: "Dados fiscais salvos com acesso restrito." };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Falha ao salvar." };
  }
}

export async function recordPrivacyConsent(input: {
  purpose: "privacy_policy" | "terms_of_use" | "marketing";
  granted: boolean;
}): Promise<ActionResult> {
  try {
    const user = await requireUser();
    if (input.purpose !== "marketing" && !input.granted) {
      return { ok: false, error: "Este aceite é necessário para registrar a operação." };
    }
    const { error } = await createSupabaseAdminClient().from("privacy_consents").insert({
      profile_id: user.id,
      purpose: input.purpose,
      document_version: PRIVACY_DOCUMENT_VERSION,
      granted: input.granted,
      source: "account",
      request_fingerprint: await fingerprint(),
    });
    if (error) return { ok: false, error: "Não foi possível registrar sua preferência." };
    revalidatePath("/conta/privacidade");
    return { ok: true, message: "Preferência registrada." };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Falha ao registrar." };
  }
}

export async function requestAccountDeletion(): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdminClient();
    const { data: existing } = await admin.from("data_subject_requests").select("id")
      .eq("profile_id", user.id).eq("request_type", "deletion").in("status", ["pending", "processing"]).maybeSingle();
    if (existing) return { ok: false, error: "Já existe uma solicitação de exclusão em andamento." };
    const requesterReference = createHash("sha256").update(user.id).digest("hex");
    const { data, error } = await admin.from("data_subject_requests").insert({
      profile_id: user.id,
      request_type: "deletion",
      status: "pending",
      requester_reference: requesterReference,
    }).select("id").single();
    if (error || !data) return { ok: false, error: "Não foi possível registrar a solicitação." };
    await audit(user.id, "request_account_deletion", "data_subject_requests", data.id);
    revalidatePath("/conta/privacidade");
    return { ok: true, message: "Solicitação registrada para revisão segura." };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Falha ao solicitar exclusão." };
  }
}
