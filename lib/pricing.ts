import type { CartCustomization, Product } from "@/lib/types";

export interface Selection {
  colorId?: string;
  sizeId?: string;
  customName?: string;
  fields?: Record<string, string>;
  quantity: number;
}

export function computeUnitPrice(product: Product, selection: Pick<Selection, "sizeId">) {
  const sizeDelta =
    product.variants.sizes?.find((s) => s.id === selection.sizeId)?.priceDelta ?? 0;
  return product.price + sizeDelta;
}

export function computeSubtotal(product: Product, selection: Selection) {
  return computeUnitPrice(product, selection) * selection.quantity;
}

export function selectionToCustomization(product: Product, selection: Selection): CartCustomization {
  const color = product.variants.colors?.find((c) => c.id === selection.colorId);
  const size = product.variants.sizes?.find((s) => s.id === selection.sizeId);
  return {
    customName: selection.customName || undefined,
    colorId: color?.id,
    colorName: color?.name,
    sizeId: size?.id,
    sizeName: size?.name,
    fields: selection.fields,
  };
}
