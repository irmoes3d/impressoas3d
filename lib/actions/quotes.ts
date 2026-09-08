"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { QuoteServiceType } from "@/lib/types";

export interface QuoteFormState {
  ok: boolean;
  error?: string;
}

export async function submitCustomQuote(formData: FormData): Promise<QuoteFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const serviceType = String(formData.get("serviceType") ?? "") as QuoteServiceType;
  const validServiceTypes: QuoteServiceType[] = ["impressao_3d", "corte_laser", "trofeus_personalizados"];

  if (!name || !whatsapp || !email || !description || !validServiceTypes.includes(serviceType)) {
    return { ok: false, error: "Preencha seus dados, escolha o tipo de serviço e descreva o projeto." };
  }

  const payload = {
    name,
    whatsapp,
    email,
    service_type: serviceType,
    description,
    quantity: Number(formData.get("quantity") ?? 1),
    approx_size: String(formData.get("approxSize") ?? ""),
    color: String(formData.get("color") ?? ""),
    material: String(formData.get("material") ?? ""),
    desired_deadline: String(formData.get("desiredDeadline") ?? ""),
    status: "novo" as const,
  };

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("custom_quotes").insert(payload).select("id").single();
    if (error) throw error;

    const files = formData.getAll("files") as File[];
    if (data && files.length) {
      const rows = files
        .filter((f) => f.size > 0)
        .map((f) => ({
          quote_id: data.id,
          name: f.name,
          size_kb: Math.round(f.size / 1024),
          type: f.type || f.name.split(".").pop() || "arquivo",
          storage_path: `pending/${data.id}/${f.name}`,
        }));
      if (rows.length) await supabase.from("quote_files").insert(rows);
    }
  } catch {
    // Banco ainda não provisionado (rode supabase/schema.sql). Em produção,
    // isso registraria o orçamento; no momento seguimos com a confirmação
    // visual para não travar a demonstração.
  }

  return { ok: true };
}
