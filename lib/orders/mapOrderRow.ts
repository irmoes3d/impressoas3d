import type { Address, CartCustomization, Order, OrderItem } from "@/lib/types";

export interface OrderRow {
  id: string; code: string; customer_name: string; customer_email: string; customer_phone: string;
  subtotal: string | number; discount: string | number; shipping_cost: string | number; total: string | number;
  coupon_code: string | null; address: Address; shipping_method: string; payment_method: Order["paymentMethod"];
  payment_status: Order["paymentStatus"]; status: Order["status"]; kanban_stage: Order["kanbanStage"];
  priority: Order["priority"]; printer_id: string | null; tracking_code: string | null; created_at: string; estimated_date: string | null;
  order_items: Array<{ id: string; product_id: string | null; name: string; image_seed: string | null; unit_price: string | number; quantity: number; customization: CartCustomization }>;
}

export function mapOrderRow(row: OrderRow): Order {
  const items: OrderItem[] = (row.order_items ?? []).map((item) => ({
    id: item.id, productId: item.product_id ?? "", productSlug: "", name: item.name,
    imageSeed: item.image_seed ?? "produto", unitPrice: Number(item.unit_price), quantity: item.quantity,
    customization: item.customization ?? {},
  }));
  return {
    id: row.id, code: row.code, customerName: row.customer_name, customerEmail: row.customer_email,
    customerPhone: row.customer_phone, items, subtotal: Number(row.subtotal), discount: Number(row.discount),
    shippingCost: Number(row.shipping_cost), total: Number(row.total), couponCode: row.coupon_code ?? undefined,
    address: row.address, shippingMethod: row.shipping_method, paymentMethod: row.payment_method,
    paymentStatus: row.payment_status, status: row.status, kanbanStage: row.kanban_stage, priority: row.priority,
    printerId: row.printer_id ?? undefined, trackingCode: row.tracking_code ?? undefined,
    createdAt: row.created_at, estimatedDate: row.estimated_date ?? row.created_at.slice(0, 10),
  };
}
