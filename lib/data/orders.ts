import type { KanbanStage, Order, OrderItem, ProductionStatus } from "@/lib/types";
import { customers } from "@/lib/data/customers";
import { getProductBySlug } from "@/lib/data/products";

function item(slug: string, quantity = 1, colorName?: string, sizeName?: string): OrderItem {
  const p = getProductBySlug(slug)!;
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${slug}-${quantity}`,
    productId: p.id,
    productSlug: p.slug,
    name: p.name,
    imageSeed: p.images[0]?.seed ?? p.slug,
    unitPrice: p.price,
    quantity,
    customization: { colorName, sizeName },
  };
}

function addr(city: string, state: string) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : city,
    label: "Entrega",
    cep: "01310-100",
    street: "Rua das Impressoras",
    number: "123",
    district: "Centro",
    city,
    state,
  };
}

interface Seed {
  code: string;
  customer: number;
  items: OrderItem[];
  status: ProductionStatus;
  kanbanStage: KanbanStage;
  paymentStatus: Order["paymentStatus"];
  paymentMethod: Order["paymentMethod"];
  priority: Order["priority"];
  createdAt: string;
  printerId?: string;
  trackingCode?: string;
  city: string;
  state: string;
}

const seeds: Seed[] = [
  { code: "2I-4801", customer: 0, items: [item("chaveiro-personalizado-nome", 3, "Azul")], status: "entregue", kanbanStage: "pronto", paymentStatus: "aprovado", paymentMethod: "pix", priority: "normal", createdAt: "2026-07-02", trackingCode: "BR184223456BR", city: "São Paulo", state: "SP" },
  { code: "2I-4805", customer: 1, items: [item("miniatura-dragao-articulado", 1, "Verde")], status: "enviado", kanbanStage: "pronto", paymentStatus: "aprovado", paymentMethod: "cartao_credito", priority: "normal", createdAt: "2026-07-10", trackingCode: "BR184229981BR", city: "Rio de Janeiro", state: "RJ" },
  { code: "2I-4811", customer: 2, items: [item("vaso-geometrico-facetado", 2, "Branco", "Médio")], status: "controle_qualidade", kanbanStage: "acabamento", paymentStatus: "aprovado", paymentMethod: "mercado_pago", priority: "normal", createdAt: "2026-07-22", city: "Belo Horizonte", state: "MG" },
  { code: "2I-4815", customer: 3, items: [item("suporte-de-controle-duplo", 1, "Preto")], status: "acabamento", kanbanStage: "acabamento", paymentStatus: "aprovado", paymentMethod: "pix", priority: "alta", createdAt: "2026-07-25", printerId: "prt-3", city: "Curitiba", state: "PR" },
  { code: "2I-4818", customer: 4, items: [item("luminaria-lua-camadas", 1, "Azul")], status: "imprimindo", kanbanStage: "imprimindo", paymentStatus: "aprovado", paymentMethod: "pix", priority: "normal", createdAt: "2026-07-28", printerId: "prt-4", city: "Porto Alegre", state: "RS" },
  { code: "2I-4821", customer: 5, items: [item("trofeu-geek-personalizado", 1, "Amarelo")], status: "imprimindo", kanbanStage: "imprimindo", paymentStatus: "aprovado", paymentMethod: "cartao_credito", priority: "urgente", createdAt: "2026-07-29", printerId: "prt-1", city: "São Paulo", state: "SP" },
  { code: "2I-4825", customer: 6, items: [item("placa-de-porta-personalizada", 1)], status: "fila_impressao", kanbanStage: "fila_impressao", paymentStatus: "aprovado", paymentMethod: "pix", priority: "normal", createdAt: "2026-07-30", city: "Campinas", state: "SP" },
  { code: "2I-4828", customer: 7, items: [item("topo-de-bolo-personalizado", 1)], status: "fila_impressao", kanbanStage: "fila_impressao", paymentStatus: "aprovado", paymentMethod: "pix", priority: "normal", createdAt: "2026-07-31", city: "Salvador", state: "BA" },
  { code: "2I-4830", customer: 8, items: [item("base-expositora-action-figures", 1, "Preto")], status: "preparando_arquivo", kanbanStage: "arquivo_preparado", paymentStatus: "aprovado", paymentMethod: "mercado_pago", priority: "normal", createdAt: "2026-08-01", printerId: "prt-2", city: "Fortaleza", state: "CE" },
  { code: "2I-4833", customer: 9, items: [item("organizador-de-mesa-modular", 1, "Azul")], status: "preparando_arquivo", kanbanStage: "arquivo_preparado", paymentStatus: "aprovado", paymentMethod: "pix", priority: "normal", createdAt: "2026-08-02", city: "Vitória", state: "ES" },
  { code: "2I-4836", customer: 0, items: [item("suporte-de-celular-articulado", 2, "Roxo")], status: "pagamento_aprovado", kanbanStage: "aguardando", paymentStatus: "aprovado", paymentMethod: "pix", priority: "normal", createdAt: "2026-08-03", city: "São Paulo", state: "SP" },
  { code: "2I-4839", customer: 1, items: [item("porta-caneca-pixel", 3)], status: "pagamento_aprovado", kanbanStage: "aguardando", paymentStatus: "aprovado", paymentMethod: "cartao_debito", priority: "normal", createdAt: "2026-08-04", city: "Rio de Janeiro", state: "RJ" },
  { code: "2I-4842", customer: 2, items: [item("caixa-organizadora-empilhavel", 6, "Verde")], status: "recebido", kanbanStage: "aguardando", paymentStatus: "aguardando", paymentMethod: "pix", priority: "normal", createdAt: "2026-08-05", city: "Belo Horizonte", state: "MG" },
  { code: "2I-4845", customer: 3, items: [item("miniatura-personagem-sob-medida", 1)], status: "recebido", kanbanStage: "aguardando", paymentStatus: "aguardando", paymentMethod: "mercado_pago", priority: "alta", createdAt: "2026-08-06", city: "Curitiba", state: "PR" },
];

export const orders: Order[] = seeds.map((s) => {
  const subtotal = s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shippingCost = 24.9;
  const discount = 0;
  const customer = customers[s.customer];
  return {
    id: s.code,
    code: s.code,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    items: s.items,
    subtotal,
    discount,
    shippingCost,
    total: subtotal - discount + shippingCost,
    address: addr(s.city, s.state),
    shippingMethod: "Correios · PAC",
    paymentMethod: s.paymentMethod,
    paymentStatus: s.paymentStatus,
    status: s.status,
    kanbanStage: s.kanbanStage,
    priority: s.priority,
    printerId: s.printerId,
    trackingCode: s.trackingCode,
    createdAt: s.createdAt,
    estimatedDate: s.createdAt,
  };
});
