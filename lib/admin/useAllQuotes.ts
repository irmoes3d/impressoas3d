"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CustomQuote } from "@/lib/types";

interface QuoteRow {
  id: string; name: string; whatsapp: string; email: string; description: string; quantity: number;
  approx_size: string | null; color: string | null; material: string | null; desired_deadline: string | null;
  status: CustomQuote["status"]; created_at: string; estimated_price: string | number | null; admin_notes: string | null;
  quote_files: Array<{ id: string; name: string; size_kb: number; type: string }>;
}

export function useAllQuotes(): CustomQuote[] {
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.from("custom_quotes").select("*, quote_files(id,name,size_kb,type)").order("created_at", { ascending: false })
      .then(({ data }) => setQuotes(((data ?? []) as QuoteRow[]).map((row) => ({
        id: row.id, name: row.name, whatsapp: row.whatsapp, email: row.email, description: row.description,
        quantity: row.quantity, approxSize: row.approx_size ?? "", color: row.color ?? "", material: row.material ?? "",
        desiredDeadline: row.desired_deadline ?? "", status: row.status, createdAt: row.created_at,
        estimatedPrice: row.estimated_price === null ? undefined : Number(row.estimated_price), adminNotes: row.admin_notes ?? undefined,
        files: (row.quote_files ?? []).map((file) => ({ id: file.id, name: file.name, sizeKb: file.size_kb, type: file.type })),
      }))));
  }, []);

  return quotes;
}
