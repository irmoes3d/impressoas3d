"use server";

import { addBusinessDays } from "@/lib/format";
import { evaluateCoupon } from "@/lib/coupons";
import { getProductBySlug } from "@/lib/data/products";
import { computeUnitPrice } from "@/lib/pricing";
import { calculateShipping } from "@/lib/shipping";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendOrderNotification } from "@/lib/email/order-notifications";
import type { Address, CartCustomization, Order, PaymentMethod } from "@/lib/types";

interface CheckoutItemInput {
  productSlug: string;
  quantity: number;
  customization: CartCustomization;
}

interface CreateOrderInput {
  items: CheckoutItemInput[];
  customerName: string;
  customerDocument: string;
  customerEmail: string;
  customerPhone: string;
  address: Address;
  shippingId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

const ALLOWED_PAYMENT_METHODS = new Set<PaymentMethod>(["pix", "mercado_pago"]);
const MAX_ITEMS = 50;
const MAX_QUANTITY = 50;

function requiredText(value: string, field: string, maxLength: number) {
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new Error(`${field} inválido.`);
  return normalized;
}

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > MAX_ITEMS) {
    throw new Error("Carrinho inválido.");
  }
  if (!ALLOWED_PAYMENT_METHODS.has(input.paymentMethod)) throw new Error("Forma de pagamento indisponível.");

  const customerName = requiredText(input.customerName, "Nome", 120);
  const customerEmail = requiredText(input.customerEmail, "E-mail", 180).toLowerCase();
  const customerPhone = requiredText(input.customerPhone, "Telefone", 30);
  const documentDigits = input.customerDocument.replace(/\D/g, "");
  if (!/^\d{11}(\d{3})?$/.test(documentDigits)) throw new Error("CPF/CNPJ inválido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw new Error("E-mail inválido.");

  const cep = input.address.cep.replace(/\D/g, "");
  if (!/^\d{8}$/.test(cep)) throw new Error("CEP inválido.");
  const address: Address = {
    id: crypto.randomUUID(),
    label: "Entrega",
    cep,
    street: requiredText(input.address.street, "Rua", 160),
    number: requiredText(input.address.number, "Número", 30),
    complement: input.address.complement?.trim().slice(0, 100) || undefined,
    district: requiredText(input.address.district, "Bairro", 100),
    city: requiredText(input.address.city, "Cidade", 100),
    state: requiredText(input.address.state, "Estado", 2).toUpperCase(),
  };

  let totalWeight = 0;
  let maxProductionDays = 1;
  const items = input.items.map((submittedItem) => {
    if (!Number.isInteger(submittedItem.quantity) || submittedItem.quantity < 1 || submittedItem.quantity > MAX_QUANTITY) {
      throw new Error("Quantidade inválida.");
    }
    const product = getProductBySlug(requiredText(submittedItem.productSlug, "Produto", 160));
    if (!product || product.stock === 0) throw new Error("Produto indisponível.");

    const color = submittedItem.customization.colorId
      ? product.variants.colors?.find((option) => option.id === submittedItem.customization.colorId)
      : undefined;
    const size = submittedItem.customization.sizeId
      ? product.variants.sizes?.find((option) => option.id === submittedItem.customization.sizeId)
      : undefined;
    if (submittedItem.customization.colorId && !color) throw new Error("Cor inválida.");
    if (submittedItem.customization.sizeId && !size) throw new Error("Tamanho inválido.");

    const customization: CartCustomization = {
      colorId: color?.id,
      colorName: color?.name,
      sizeId: size?.id,
      sizeName: size?.name,
      customName: submittedItem.customization.customName?.trim().slice(0, 120) || undefined,
      fields: Object.fromEntries(
        Object.entries(submittedItem.customization.fields ?? {}).slice(0, 20)
          .map(([key, value]) => [key.slice(0, 80), String(value).trim().slice(0, 500)])
      ),
    };
    const unitPrice = money(computeUnitPrice(product, { sizeId: size?.id }));
    totalWeight += product.weightGrams * submittedItem.quantity;
    maxProductionDays = Math.max(maxProductionDays, product.productionDays);
    return {
      id: crypto.randomUUID(), productId: product.id, productSlug: product.slug,
      name: product.name, imageSeed: product.images[0]?.seed ?? product.slug,
      unitPrice, quantity: submittedItem.quantity, customization,
    };
  });

  const subtotal = money(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
  const normalizedCoupon = input.couponCode?.trim().toUpperCase();
  const coupon = evaluateCoupon(normalizedCoupon ?? null, subtotal);
  const discount = money(coupon.valid ? coupon.discount : 0);
  const shipping = calculateShipping(cep, totalWeight).find((option) => option.id === input.shippingId);
  if (!shipping) throw new Error("Frete inválido.");
  const total = money(Math.max(0, subtotal - discount) + shipping.cost);
  const code = `2I-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const estimatedDate = addBusinessDays(new Date(), maxProductionDays + shipping.deadlineDays).toISOString().slice(0, 10);

  const order: Order = {
    id: crypto.randomUUID(), code, customerName, customerEmail, customerPhone, items,
    subtotal, discount, shippingCost: shipping.cost, total,
    couponCode: coupon.valid ? normalizedCoupon : undefined, address,
    shippingMethod: `${shipping.carrier} · ${shipping.service}`,
    paymentMethod: input.paymentMethod, paymentStatus: "aguardando", status: "recebido",
    kanbanStage: "aguardando", priority: "normal", createdAt: new Date().toISOString(), estimatedDate,
  };

  const sessionClient = await createSupabaseServerClient();
  const { data: authData } = await sessionClient.auth.getUser();
  const admin = createSupabaseAdminClient();
  const { data: orderRow, error: orderError } = await admin.from("orders").insert({
    code, profile_id: authData.user?.id ?? null, customer_name: customerName,
    customer_email: customerEmail, customer_phone: customerPhone, subtotal, discount,
    shipping_cost: shipping.cost, total, coupon_code: order.couponCode, address,
    shipping_method: order.shippingMethod, payment_method: order.paymentMethod,
    payment_status: "aguardando", status: "recebido", kanban_stage: "aguardando",
    estimated_date: estimatedDate,
  }).select("id").single();
  if (orderError || !orderRow) throw new Error("Não foi possível registrar o pedido com segurança.");
  order.id = orderRow.id;

  const { error: itemsError } = await admin.from("order_items").insert(items.map((item) => ({
    order_id: orderRow.id, product_id: isUuid(item.productId) ? item.productId : null,
    name: item.name, image_seed: item.imageSeed, unit_price: item.unitPrice,
    quantity: item.quantity, customization: item.customization,
  })));
  const { error: paymentError } = await admin.from("payments").insert({
    order_id: orderRow.id, method: order.paymentMethod, status: "aguardando", amount: total,
    provider: order.paymentMethod === "mercado_pago" ? "mercado_pago" : "pix_pending",
    provider_external_reference: orderRow.id,
  });
  if (itemsError || paymentError) {
    await admin.from("orders").delete().eq("id", orderRow.id);
    throw new Error("Não foi possível registrar os itens do pedido.");
  }
  await sendOrderNotification({
    orderId: order.id, orderCode: order.code, customerName: order.customerName,
    customerEmail: order.customerEmail, status: "recebido", eventType: "new_order",
    eventKey: `new-order:${order.id}`, adminOnly: true,
  });
  return order;
}
