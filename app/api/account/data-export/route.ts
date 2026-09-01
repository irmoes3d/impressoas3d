import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const client = await createSupabaseServerClient();
  const { data: authData } = await client.auth.getUser();
  if (!authData.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = authData.user;
  const admin = createSupabaseAdminClient();
  const [{ data: profile }, { data: addresses }, { data: orders }, { data: fiscal }, { data: consents }] = await Promise.all([
    admin.from("profiles").select("name, email, phone, created_at").eq("id", user.id).maybeSingle(),
    admin.from("addresses").select("label, cep, street, number, complement, district, city, state, is_default, created_at").eq("profile_id", user.id),
    admin.from("orders").select("id, code, subtotal, discount, shipping_cost, total, payment_method, payment_status, status, created_at, order_items(name, unit_price, quantity, customization)").eq("profile_id", user.id),
    admin.from("customer_private_data").select("document, legal_name, state_registration, retention_until, updated_at").eq("profile_id", user.id).maybeSingle(),
    admin.from("privacy_consents").select("purpose, document_version, granted, source, created_at").eq("profile_id", user.id),
  ]);

  const requesterReference = createHash("sha256").update(user.id).digest("hex");
  const { data: requestRow } = await admin.from("data_subject_requests").insert({
    profile_id: user.id,
    request_type: "export",
    status: "completed",
    requester_reference: requesterReference,
    completed_at: new Date().toISOString(),
  }).select("id").single();
  await admin.from("admin_audit_logs").insert({
    actor_profile_id: user.id,
    action: "export_own_data",
    target_table: "data_subject_requests",
    target_id: requestRow?.id ?? null,
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email, profile },
    fiscal,
    addresses: addresses ?? [],
    orders: orders ?? [],
    consents: consents ?? [],
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="meus-dados-2-irmaos-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store, private, max-age=0",
      Pragma: "no-cache",
    },
  });
}
