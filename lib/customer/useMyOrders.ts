"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";
import { mapOrderRow, type OrderRow } from "@/lib/orders/mapOrderRow";

export function useMyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();
    supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setOrders(((data ?? []) as OrderRow[]).map(mapOrderRow));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { orders, loading };
}
