import { findCoupon } from "@/lib/data/coupons";

export interface CouponResult {
  valid: boolean;
  message: string;
  discount: number;
}

export function evaluateCoupon(code: string | null, subtotal: number): CouponResult {
  if (!code) return { valid: false, message: "", discount: 0 };
  const coupon = findCoupon(code);

  if (!coupon) return { valid: false, message: "Cupom não encontrado.", discount: 0 };
  if (!coupon.active || new Date(coupon.expiresAt) < new Date())
    return { valid: false, message: "Este cupom expirou.", discount: 0 };
  if (coupon.usedCount >= coupon.maxUses)
    return { valid: false, message: "Este cupom atingiu o limite de usos.", discount: 0 };
  if (subtotal < coupon.minOrderValue)
    return { valid: false, message: `Válido a partir de ${coupon.minOrderValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`, discount: 0 };

  const discount = coupon.type === "percentual" ? (subtotal * coupon.value) / 100 : coupon.value;
  return { valid: true, message: `Cupom ${coupon.code} aplicado!`, discount: Math.min(discount, subtotal) };
}
