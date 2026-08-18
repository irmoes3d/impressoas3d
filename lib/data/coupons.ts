import type { Coupon } from "@/lib/types";

export const coupons: Coupon[] = [
  { id: "cp-1", code: "PRIMEIRACOMPRA", type: "percentual", value: 10, minOrderValue: 0, maxUses: 500, usedCount: 128, expiresAt: "2026-12-31", active: true },
  { id: "cp-2", code: "FRETE20", type: "fixo", value: 20, minOrderValue: 150, maxUses: 200, usedCount: 54, expiresAt: "2026-10-31", active: true },
  { id: "cp-3", code: "GEEK15", type: "percentual", value: 15, minOrderValue: 100, maxUses: 100, usedCount: 41, expiresAt: "2026-09-30", active: true },
  { id: "cp-4", code: "BLACKFRIDAY25", type: "percentual", value: 25, minOrderValue: 200, maxUses: 300, usedCount: 300, expiresAt: "2025-11-30", active: false },
];

export function findCoupon(code: string) {
  return coupons.find((c) => c.code === code.toUpperCase());
}
