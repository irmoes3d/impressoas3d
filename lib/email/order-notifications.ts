import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PRODUCTION_STATUS_LABEL, type ProductionStatus } from "@/lib/types";

type NotificationInput = {
  orderId: string; orderCode: string; customerName: string; customerEmail: string;
  eventKey: string; eventType: "new_order" | "payment_approved" | "status_changed";
  status: ProductionStatus; trackingCode?: string | null; adminOnly?: boolean;
};

const ADMIN_ORDER_EMAIL = "irmoes3d@outlook.com";

export async function sendAdminTestEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from) return { sent: false, reason: "email_not_configured" } as const;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [ADMIN_ORDER_EMAIL], subject: "Teste de e-mail — 2 Irmãos Impressões 3D",
        html: "<div style=\"font-family:Arial,sans-serif;line-height:1.6\"><h1>Configuração concluída</h1><p>O envio de notificações de pedidos pelo Resend está funcionando.</p></div>",
      }),
      cache: "no-store", signal: AbortSignal.timeout(8_000),
    });
    return { sent: response.ok, reason: response.ok ? undefined : "delivery_failed" } as const;
  } catch {
    return { sent: false, reason: "delivery_failed" } as const;
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]!);
}

function message(input: NotificationInput) {
  const statusLabel = PRODUCTION_STATUS_LABEL[input.status];
  const newOrder = input.eventType === "new_order";
  const payment = input.eventType === "payment_approved";
  const subject = newOrder ? `Novo pedido recebido — ${input.orderCode}` : payment ? `Pagamento aprovado — pedido ${input.orderCode}` : `Atualização do pedido ${input.orderCode}: ${statusLabel}`;
  const headline = newOrder ? "Novo pedido recebido" : payment ? "Pagamento aprovado" : "Seu pedido foi atualizado";
  const tracking = input.status === "enviado" && input.trackingCode
    ? `<p><strong>Código de rastreamento:</strong> ${escapeHtml(input.trackingCode)}</p>` : "";
  return {
    subject,
    html: `<div style="font-family:Arial,sans-serif;color:#172033;line-height:1.6"><h1 style="font-size:22px">${headline}</h1><p>Olá, ${escapeHtml(input.customerName)}.</p><p>O pedido <strong>${escapeHtml(input.orderCode)}</strong> agora está com o status <strong>${escapeHtml(statusLabel)}</strong>.</p>${tracking}<p>Acompanhe o pedido somente pelo site oficial. Nunca faça pagamentos por links ou códigos recebidos por e-mail.</p><p>2 Irmãos Impressões 3D</p></div>`,
  };
}

export async function sendOrderNotification(input: NotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from) return { sent: false, reason: "email_not_configured" } as const;

  const admin = createSupabaseAdminClient();
  const { data: inserted, error: insertError } = await admin.from("order_email_notifications").insert({
    order_id: input.orderId, event_key: input.eventKey, event_type: input.eventType,
    recipient: input.adminOnly ? ADMIN_ORDER_EMAIL : input.customerEmail.trim().toLowerCase(), order_status: input.status,
  }).select("id").single();

  let notificationId = inserted?.id as string | undefined;
  if (insertError?.code === "23505") {
    const { data: existing } = await admin.from("order_email_notifications")
      .select("id, delivery_status").eq("event_key", input.eventKey).maybeSingle();
    if (!existing || existing.delivery_status === "sent" || existing.delivery_status === "sending") {
      return { sent: existing?.delivery_status === "sent", reason: "duplicate" } as const;
    }
    notificationId = existing.id;
  } else if (insertError || !notificationId) {
    return { sent: false, reason: "log_failed" } as const;
  }

  const { data: claimed } = await admin.from("order_email_notifications")
    .update({ delivery_status: "sending", last_error: null }).eq("id", notificationId)
    .in("delivery_status", ["pending", "failed"]).select("id, attempts").maybeSingle();
  if (!claimed) return { sent: false, reason: "already_claimed" } as const;

  const content = message(input);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [input.adminOnly ? ADMIN_ORDER_EMAIL : input.customerEmail],
        bcc: input.adminOnly ? undefined : [ADMIN_ORDER_EMAIL],
        subject: content.subject,
        html: content.html,
      }),
      cache: "no-store", signal: AbortSignal.timeout(8_000),
    });
    const result = await response.json().catch(() => ({})) as { id?: string; message?: string };
    if (!response.ok) throw new Error(result.message || `Email provider returned ${response.status}`);
    await admin.from("order_email_notifications").update({
      delivery_status: "sent", attempts: Number(claimed.attempts) + 1,
      provider_message_id: result.id ?? null, sent_at: new Date().toISOString(),
    }).eq("id", notificationId);
    return { sent: true } as const;
  } catch (error) {
    await admin.from("order_email_notifications").update({
      delivery_status: "failed", attempts: Number(claimed.attempts) + 1,
      last_error: error instanceof Error ? error.message.slice(0, 500) : "Unknown delivery error",
    }).eq("id", notificationId);
    return { sent: false, reason: "delivery_failed" } as const;
  }
}
