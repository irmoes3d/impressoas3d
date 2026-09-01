import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ProviderPayment = {
  id: number;
  status: string;
  currency_id: string;
  external_reference: string | null;
  transaction_amount: number | string;
  date_approved?: string | null;
};

function parseSignature(header: string) {
  return Object.fromEntries(header.split(",").map((part) => part.trim().split("=", 2))) as Record<string, string>;
}

function validSignature(signature: string, requestId: string, dataId: string, secret: string) {
  const { ts, v1 } = parseSignature(signature);
  if (!/^\d+$/.test(ts ?? "") || !/^[a-f0-9]{64}$/i.test(v1 ?? "")) return false;
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(ts));
  if (ageSeconds > 600) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  const received = Buffer.from(v1, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function internalStatus(providerStatus: string) {
  if (providerStatus === "approved") return "aprovado";
  if (["refunded", "charged_back"].includes(providerStatus)) return "estornado";
  if (["rejected", "cancelled"].includes(providerStatus)) return "recusado";
  return "aguardando";
}

export async function POST(request: Request) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!secret || !accessToken) return Response.json({ error: "Payment integration disabled" }, { status: 503 });

  const url = new URL(request.url);
  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  let body: { data?: { id?: string | number }; type?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const dataId = String(url.searchParams.get("data.id") ?? body.data?.id ?? "");
  if (!dataId || !requestId || !validSignature(signature, requestId, dataId, secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }
  if (body.type && body.type !== "payment") return Response.json({ accepted: true });

  const providerResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!providerResponse.ok) return Response.json({ error: "Provider verification failed" }, { status: 502 });
  const providerPayment = await providerResponse.json() as ProviderPayment;
  if (String(providerPayment.id) !== dataId || providerPayment.currency_id !== "BRL") {
    return Response.json({ error: "Payment identity mismatch" }, { status: 409 });
  }

  const admin = createSupabaseAdminClient();
  const { data: payment } = await admin.from("payments")
    .select("id, order_id, amount, provider_external_reference")
    .eq("provider", "mercado_pago")
    .eq("provider_payment_id", dataId)
    .maybeSingle();
  if (!payment) return Response.json({ error: "Unknown payment" }, { status: 404 });

  const amountMatches = Math.abs(Number(payment.amount) - Number(providerPayment.transaction_amount)) < 0.001;
  if (!amountMatches || providerPayment.external_reference !== payment.provider_external_reference) {
    return Response.json({ error: "Payment amount or reference mismatch" }, { status: 409 });
  }

  const payloadHash = createHash("sha256").update(JSON.stringify(body)).digest("hex");
  const { error: eventError } = await admin.from("payment_webhook_events").insert({
    provider: "mercado_pago", provider_request_id: requestId, provider_payment_id: dataId,
    event_type: body.action ?? body.type ?? "payment", payload_hash: payloadHash,
  });
  if (eventError?.code === "23505") return Response.json({ accepted: true, duplicate: true });
  if (eventError) return Response.json({ error: "Could not record event" }, { status: 500 });

  const status = internalStatus(providerPayment.status);
  const { error: paymentError } = await admin.from("payments").update({
    status,
    paid_at: status === "aprovado" ? (providerPayment.date_approved ?? new Date().toISOString()) : null,
    verified_at: new Date().toISOString(),
  }).eq("id", payment.id);
  if (paymentError) return Response.json({ error: "Could not update payment" }, { status: 500 });

  const orderUpdate = status === "aprovado"
    ? { payment_status: status, status: "pagamento_aprovado", kanban_stage: "aguardando" }
    : { payment_status: status };
  const { error: orderError } = await admin.from("orders").update(orderUpdate).eq("id", payment.order_id);
  if (orderError) return Response.json({ error: "Could not update order" }, { status: 500 });
  return Response.json({ accepted: true });
}
