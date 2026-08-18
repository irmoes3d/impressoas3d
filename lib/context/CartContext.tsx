"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  couponCode: string | null;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  subtotal: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "2irmaos:cart";
const COUPON_KEY = "2irmaos:coupon";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const coupon = localStorage.getItem(COUPON_KEY);
      if (coupon) setCouponCode(coupon);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (couponCode) localStorage.setItem(COUPON_KEY, couponCode);
    else localStorage.removeItem(COUPON_KEY);
  }, [couponCode, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    return {
      items,
      addItem: (item) => {
        setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
      },
      removeItem: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      updateQuantity: (id, quantity) =>
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
        ),
      clear: () => {
        setItems([]);
        setCouponCode(null);
      },
      couponCode,
      applyCoupon: (code) => setCouponCode(code.toUpperCase()),
      removeCoupon: () => setCouponCode(null),
      subtotal,
      count,
    };
  }, [items, couponCode]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
