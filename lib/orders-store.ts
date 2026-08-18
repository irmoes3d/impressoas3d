"use client";

import type { Order } from "@/lib/types";

// Fallback local: garante que o acompanhamento de pedido funcione na demo
// mesmo antes do schema do Supabase ser aplicado. Quando o banco estiver
// disponível, createOrder() também grava lá (lib/actions/orders.ts).
const KEY = "2irmaos:orders";

export function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveStoredOrder(order: Order) {
  const orders = getStoredOrders();
  localStorage.setItem(KEY, JSON.stringify([order, ...orders]));
}

export function getStoredOrder(id: string): Order | undefined {
  return getStoredOrders().find((o) => o.id === id || o.code === id);
}

export function updateStoredOrder(id: string, patch: Partial<Order>) {
  const orders = getStoredOrders().map((o) => (o.id === id ? { ...o, ...patch } : o));
  localStorage.setItem(KEY, JSON.stringify(orders));
}
