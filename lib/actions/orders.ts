"use client";

import type { Address, CartItem, Order, PaymentMethod } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { saveStoredOrder } from "@/lib/orders-store";
import { addBusinessDays } from "@/lib/format";
import type { ShippingOption } from "@/lib/shipping";

interface CreateOrderInput {
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: Address;
  shipping: ShippingOption;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  discount: number;
  subtotal: number;
  maxProductionDays: number;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const total = Math.max(0, input.subtotal - input.discount) + input.shipping.cost;
  const code = `2I-${Math.floor(1000 + Math.random() * 9000)}`;
  const estimatedDate = addBusinessDays(new Date(), input.maxProductionDays + input.shipping.deadlineDays)
    .toISOString()
    .slice(0, 10);

  const order: Order = {
    id: crypto.randomUUID(),
    code,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    items: input.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productSlug: i.productSlug,
      name: i.name,
      imageSeed: i.imageSeed,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      customization: i.customization,
    })),
    subtotal: input.subtotal,
    discount: input.discount,
    shippingCost: input.shipping.cost,
    total,
    couponCode: input.couponCode,
    address: input.address,
    shippingMethod: `${input.shipping.carrier} · ${input.shipping.service}`,
    paymentMethod: input.paymentMethod,
    paymentStatus: "aguardando",
    status: "recebido",
    kanbanStage: "aguardando",
    priority: "normal",
    createdAt: new Date().toISOString(),
    estimatedDate,
  };

  saveStoredOrder(order);

  try {
    const supabase = createSupabaseBrowserClient();
    const { data: authData } = await supabase.auth.getUser();
    const { data: orderRow, error } = await supabase
      .from("orders")
      .insert({
        code: order.code,
        profile_id: authData.user?.id ?? null,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping_cost: order.shippingCost,
        total: order.total,
        coupon_code: order.couponCode,
        address: order.address,
        shipping_method: order.shippingMethod,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        status: order.status,
        kanban_stage: order.kanbanStage,
        estimated_date: order.estimatedDate,
      })
      .select("id")
      .single();

    if (!error && orderRow) {
      await supabase.from("order_items").insert(
        order.items.map((i) => ({
          order_id: orderRow.id,
          product_id: i.productId,
          name: i.name,
          image_seed: i.imageSeed,
          unit_price: i.unitPrice,
          quantity: i.quantity,
          customization: i.customization,
        }))
      );
      await supabase.from("payments").insert({
        order_id: orderRow.id,
        method: order.paymentMethod,
        status: "aguardando",
        amount: order.total,
        pix_code: order.paymentMethod === "pix" ? buildFakePixCode(order.code, order.total) : null,
      });
    }
  } catch {
    // Banco ainda não provisionado — o pedido segue disponível via localStorage.
  }

  return order;
}

export function buildFakePixCode(code: string, total: number) {
  const amount = total.toFixed(2).replace(".", "");
  return `00020126580014BR.GOV.BCB.PIX0136${code}-${amount}5204000053039865802BR5925 2 IRMAOS IMPRESSOES 3D6009SAO PAULO62070503***6304${code.slice(-4)}`;
}
