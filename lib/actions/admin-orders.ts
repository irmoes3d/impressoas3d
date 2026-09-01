"use server";

import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendAdminTestEmail as deliverAdminTestEmail, sendOrderNotification } from "@/lib/email/order-notifications";
import { PRODUCTION_STATUS_ORDER, type ProductionStatus } from "@/lib/types";

type UpdateOrderInput = { orderId: string; status?: ProductionStatus; printerId?: string | null; trackingCode?: string | null };

async function authorizeStaff() {
  const sessionClient = await createSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return false;
  const { data: profile } = await sessionClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return Boolean(profile && ["admin", "funcionario"].includes(profile.role));
}

export async function sendAdminEmailTest() {
  if (!await authorizeStaff()) return { ok: false, error: "Acesso não autorizado." };
  const result = await deliverAdminTestEmail();
  return result.sent ? { ok: true } : { ok: false, error: result.reason === "email_not_configured" ? "Resend ainda não está configurado neste ambiente." : "O Resend recusou o envio." };
}

export async function updateAdminOrder(input: UpdateOrderInput) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.orderId)) return { ok: false, error: "Pedido inválido." };
  if (input.status && !PRODUCTION_STATUS_ORDER.includes(input.status)) return { ok: false, error: "Status inválido." };

  if (!await authorizeStaff()) return { ok: false, error: "Acesso não autorizado." };

  const admin = createSupabaseAdminClient();
  const { data: current } = await admin.from("orders").select("id, code, customer_name, customer_email, status, tracking_code").eq("id", input.orderId).maybeSingle();
  if (!current) return { ok: false, error: "Pedido não encontrado." };

  if (input.status === "fila_impressao") {
    const { data: preview } = await admin.from("order_files").select("id").eq("order_id", input.orderId).eq("file_kind", "previa").limit(1);
    if (preview?.length) {
      const { data: approval } = await admin.from("design_approvals").select("status").eq("order_id", input.orderId).maybeSingle();
      if (approval?.status !== "aprovado") return { ok: false, error: "O cliente precisa aprovar a prévia antes da fila de impressão." };
    }
  }

  const update: Record<string, string | null> = {};
  if (input.status) update.status = input.status;
  if (input.printerId !== undefined) update.printer_id = input.printerId;
  if (input.trackingCode !== undefined) update.tracking_code = input.trackingCode?.trim().slice(0, 80) || null;
  if (!Object.keys(update).length) return { ok: false, error: "Nenhuma alteração informada." };
  const { data: updated, error } = await admin.from("orders").update(update)
    .eq("id", input.orderId).eq("status", current.status).select("id").maybeSingle();
  if (error || !updated) return { ok: false, error: "O pedido foi alterado por outra sessão. Atualize a página e tente novamente." };

  let emailSent: boolean | undefined;
  if (input.status && input.status !== current.status) {
    const delivery = await sendOrderNotification({
      orderId: current.id, orderCode: current.code, customerName: current.customer_name,
      customerEmail: current.customer_email, status: input.status,
      trackingCode: input.trackingCode ?? current.tracking_code,
      eventType: "status_changed", eventKey: `status:${current.id}:${input.status}:${randomUUID()}`,
    });
    emailSent = delivery.sent;
  }
  return { ok: true, emailSent };
}
