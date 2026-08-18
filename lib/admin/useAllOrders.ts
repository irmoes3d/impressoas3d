"use client";

import { useEffect, useState } from "react";
import { orders as seedOrders } from "@/lib/data/orders";
import { getStoredOrders } from "@/lib/orders-store";
import type { Order } from "@/lib/types";

/** Combina os pedidos fictícios com os criados nesta sessão via checkout (localStorage). */
export function useAllOrders(): Order[] {
  const [orders, setOrders] = useState<Order[]>(seedOrders);

  useEffect(() => {
    setOrders([...getStoredOrders(), ...seedOrders]);
  }, []);

  return orders;
}
