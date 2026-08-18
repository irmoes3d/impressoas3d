"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { ProductPlaceholder } from "@/components/media/ProductPlaceholder";
import { formatBRL } from "@/lib/format";
import { evaluateCoupon } from "@/lib/coupons";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, subtotal, couponCode, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const router = useRouter();

  const coupon = evaluateCoupon(couponCode, subtotal);
  const discount = coupon.valid ? coupon.discount : 0;
  const total = subtotal - discount;

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag size={48} className="text-graphite-300" />
        <h1 className="font-display text-2xl font-bold text-ink">Seu carrinho está vazio</h1>
        <p className="text-sm text-graphite-400">Que tal dar uma olhada nos nossos produtos?</p>
        <Link href="/produtos" className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-600">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-ink">Carrinho</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-graphite-100 p-4">
              <Link href={`/produtos/${item.productSlug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-graphite-100 sm:h-24 sm:w-24">
                <ProductPlaceholder seed={item.imageSeed} alt={item.name} className="h-full w-full" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link href={`/produtos/${item.productSlug}`} className="font-display text-sm font-semibold text-ink hover:text-accent">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-graphite-400">
                      {[item.customization.colorName, item.customization.sizeName, item.customization.customName && `Nome: ${item.customization.customName}`]
                        .filter(Boolean)
                        .join(" · ") || "Sem personalização"}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.id)} aria-label="Remover item" className="h-fit text-graphite-300 hover:text-danger">
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div className="inline-flex items-center rounded-full border border-graphite-200">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center text-graphite-600" aria-label="Diminuir">
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center text-graphite-600" aria-label="Aumentar">
                      <Plus size={13} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-graphite-400">{formatBRL(item.unitPrice)} un.</p>
                    <p className="font-display text-sm font-bold text-ink">{formatBRL(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link href="/produtos" className="inline-block text-sm font-semibold text-accent">
            ← Continuar comprando
          </Link>
        </div>

        <div className="h-fit space-y-5 rounded-2xl border border-graphite-100 bg-graphite-100/40 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Resumo</h2>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite-400">Cupom de desconto</label>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Ex: PRIMEIRACOMPRA"
                className="w-full rounded-xl border border-graphite-200 px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={() => applyCoupon(couponInput)}
                className="flex items-center gap-1 whitespace-nowrap rounded-xl bg-ink px-4 text-sm font-semibold text-white"
              >
                <Tag size={14} /> Aplicar
              </button>
            </div>
            {couponCode && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={coupon.valid ? "text-ok" : "text-danger"}>{coupon.valid ? coupon.message : coupon.message || "Cupom inválido."}</span>
                <button onClick={removeCoupon} className="text-graphite-400 underline">remover</button>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-graphite-200 pt-4 text-sm">
            <div className="flex justify-between text-graphite-500">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-graphite-500">
              <span>Desconto</span>
              <span className={discount > 0 ? "text-ok" : ""}>- {formatBRL(discount)}</span>
            </div>
            <div className="flex justify-between text-graphite-500">
              <span>Frete</span>
              <span>Calculado no checkout</span>
            </div>
            <div className="flex justify-between border-t border-graphite-200 pt-2 font-display text-base font-bold text-ink">
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition hover:bg-accent-600"
          >
            Finalizar compra
          </button>
        </div>
      </div>
    </div>
  );
}
