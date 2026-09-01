// Tipos centrais do domínio da loja. Espelham as tabelas de supabase/schema.sql
// para que a troca de dados mock -> Supabase não exija remodelar as páginas.

export type UUID = string;

export type ProductionStatus =
  | "recebido"
  | "pagamento_aprovado"
  | "preparando_arquivo"
  | "fila_impressao"
  | "imprimindo"
  | "acabamento"
  | "controle_qualidade"
  | "embalando"
  | "enviado"
  | "entregue"
  | "cancelado";

export const PRODUCTION_STATUS_LABEL: Record<ProductionStatus, string> = {
  recebido: "Pedido recebido",
  pagamento_aprovado: "Pagamento aprovado",
  preparando_arquivo: "Preparando arquivo",
  fila_impressao: "Na fila de impressão",
  imprimindo: "Em impressão",
  acabamento: "Acabamento",
  controle_qualidade: "Controle de qualidade",
  embalando: "Embalando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado (pagamento não confirmado em 24h)",
};

export const PRODUCTION_STATUS_ORDER: ProductionStatus[] = [
  "recebido",
  "pagamento_aprovado",
  "preparando_arquivo",
  "fila_impressao",
  "imprimindo",
  "acabamento",
  "controle_qualidade",
  "embalando",
  "enviado",
  "entregue",
];

export type KanbanStage =
  | "aguardando"
  | "arquivo_preparado"
  | "fila_impressao"
  | "imprimindo"
  | "acabamento"
  | "pronto";

export const KANBAN_STAGE_LABEL: Record<KanbanStage, string> = {
  aguardando: "Aguardando",
  arquivo_preparado: "Arquivo preparado",
  fila_impressao: "Fila de impressão",
  imprimindo: "Imprimindo",
  acabamento: "Acabamento",
  pronto: "Pronto",
};

export type ProductBadge = "mais-vendido" | "novo" | "oferta" | null;

export type FieldType = "texto" | "numero" | "data" | "cor" | "upload" | "observacoes";

export interface CustomFieldDef {
  id: UUID;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ColorOption {
  id: UUID;
  name: string;
  hex: string;
}

export interface SizeOption {
  id: UUID;
  name: string;
  priceDelta: number;
}

export interface ProductVariantGroup {
  colors?: ColorOption[];
  sizes?: SizeOption[];
  allowCustomColor?: boolean;
}

export interface ProductImage {
  id: UUID;
  seed: string;
  alt: string;
}

export interface Category {
  id: UUID;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface Review {
  id: UUID;
  productId: UUID;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  photoSeed?: string;
}

export interface Product {
  id: UUID;
  slug: string;
  sku: string;
  name: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  material: string;
  weightGrams: number;
  dimensions: string;
  productionDays: number;
  shippingDays: number;
  price: number;
  compareAtPrice?: number;
  installments: number;
  stock: number;
  madeToOrder: boolean;
  badge: ProductBadge;
  ratingAvg: number;
  ratingCount: number;
  soldCount: number;
  active?: boolean;
  images: ProductImage[];
  variants: ProductVariantGroup;
  allowCustomName: boolean;
  customFields: CustomFieldDef[];
  createdAt: string;
  tags: string[];
}

export interface CartCustomization {
  customName?: string;
  colorId?: string;
  colorName?: string;
  sizeId?: string;
  sizeName?: string;
  fields?: Record<string, string>;
}

export interface CartItem {
  id: UUID;
  productId: UUID;
  productSlug: string;
  name: string;
  imageSeed: string;
  unitPrice: number;
  quantity: number;
  customization: CartCustomization;
}

export interface Address {
  id: UUID;
  label: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export interface Customer {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  document: string;
  createdAt: string;
  addresses: Address[];
}

export interface OrderItem {
  id: UUID;
  productId: UUID;
  productSlug: string;
  name: string;
  imageSeed: string;
  unitPrice: number;
  quantity: number;
  customization: CartCustomization;
}

export type PaymentMethod = "pix" | "cartao_credito" | "cartao_debito" | "mercado_pago";
export type PaymentStatus = "aguardando" | "aprovado" | "recusado" | "estornado";

export interface Order {
  id: UUID;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode?: string;
  address: Address;
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: ProductionStatus;
  kanbanStage: KanbanStage;
  priority: "normal" | "alta" | "urgente";
  printerId?: UUID;
  trackingCode?: string;
  createdAt: string;
  estimatedDate: string;
}

export type QuoteStatus = "novo" | "em_analise" | "orcamento_enviado" | "aprovado" | "recusado";

export interface QuoteFile {
  id: UUID;
  name: string;
  sizeKb: number;
  type: string;
}

export interface CustomQuote {
  id: UUID;
  name: string;
  whatsapp: string;
  email: string;
  description: string;
  quantity: number;
  approxSize: string;
  color: string;
  material: string;
  desiredDeadline: string;
  files: QuoteFile[];
  status: QuoteStatus;
  createdAt: string;
  estimatedPrice?: number;
  adminNotes?: string;
}

export type CouponType = "percentual" | "fixo";

export interface Coupon {
  id: UUID;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export type PrinterStatus = "disponivel" | "imprimindo" | "manutencao" | "offline";

export interface Printer {
  id: UUID;
  name: string;
  model: string;
  status: PrinterStatus;
  currentOrderCode?: string;
}

export interface Material {
  id: UUID;
  type: string;
  brand: string;
  color: string;
  weightAvailableG: number;
  costPerKg: number;
  batch: string;
  lowStockThresholdG: number;
}

export interface StoreSettings {
  whatsappNumber: string;
  storeName: string;
  email: string;
  instagram: string;
  address: string;
}
