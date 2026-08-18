import type { ProductBadge } from "@/lib/types";

const LABEL: Record<NonNullable<ProductBadge>, string> = {
  "mais-vendido": "Mais vendido",
  novo: "Novo",
  oferta: "Oferta",
};

const CLASS: Record<NonNullable<ProductBadge>, string> = {
  "mais-vendido": "bg-ink text-white",
  novo: "bg-accent text-white",
  oferta: "bg-sun text-white",
};

export function ProductBadgePill({ badge }: { badge: ProductBadge }) {
  if (!badge) return null;
  return (
    <span
      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${CLASS[badge]}`}
    >
      {LABEL[badge]}
    </span>
  );
}
