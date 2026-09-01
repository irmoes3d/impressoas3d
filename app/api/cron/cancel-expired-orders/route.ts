import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendOrderNotification } from "@/lib/email/order-notifications";

// Chamado pelo cron do Vercel (vercel.json) para cancelar pedidos cujo pagamento
// não foi confirmado em 24h. Só afeta pedidos ainda em "recebido" com
// payment_status "aguardando" — uma vez aprovado o pagamento o webhook já
// move o pedido para "pagamento_aprovado" e ele sai do alcance deste job.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
    }
  }

  const admin = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: expired, error: findError } = await admin
    .from("orders")
    .select("id, code, customer_name, customer_email")
    .eq("payment_status", "aguardando")
    .eq("status", "recebido")
    .lt("created_at", cutoff);

  if (findError) {
    return NextResponse.json({ ok: false, error: findError.message }, { status: 500 });
  }
  if (!expired || expired.length === 0) {
    return NextResponse.json({ ok: true, cancelled: 0 });
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({ status: "cancelado", cancelled_at: new Date().toISOString() })
    .in("id", expired.map((o) => o.id));

  if (updateError) {
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  for (const order of expired) {
    await sendOrderNotification({
      orderId: order.id,
      orderCode: order.code,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      status: "cancelado",
      eventType: "status_changed",
      eventKey: `auto-cancel:${order.id}`,
    });
  }

  return NextResponse.json({ ok: true, cancelled: expired.length });
}
