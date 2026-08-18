import type { Review } from "@/lib/types";

export const reviews: Review[] = [
  { id: "rev-1", productId: "prod-chaveiro-nome", customerName: "Marina Souza", rating: 5, comment: "Perfeito! Chegou rapidinho e o acabamento é impecável. Já pedi mais 3 de presente.", verifiedPurchase: true, createdAt: "2026-07-02" },
  { id: "rev-2", productId: "prod-chaveiro-nome", customerName: "Diego Farias", rating: 5, comment: "Fiz com o nome da minha filha, ficou lindo. Recomendo demais.", verifiedPurchase: true, createdAt: "2026-06-18" },
  { id: "rev-3", productId: "prod-chaveiro-nome", customerName: "Paula Nunes", rating: 4, comment: "Muito bom, só achei a argola um pouco pequena.", verifiedPurchase: true, createdAt: "2026-05-30" },
  { id: "rev-4", productId: "prod-dragao-articulado".replace("dragao-articulado", "miniatura-dragao"), customerName: "Rafael Lima", rating: 5, comment: "As crianças amaram, se mexe direitinho e é super resistente.", verifiedPurchase: true, createdAt: "2026-04-12" },
  { id: "rev-5", productId: "prod-vaso-geometrico", customerName: "Camila Rocha", rating: 5, comment: "Vaso lindo, ficou perfeito na estante. Impressão bem definida.", verifiedPurchase: true, createdAt: "2026-03-22" },
  { id: "rev-6", productId: "prod-suporte-controle", customerName: "Bruno Alves", rating: 5, comment: "Resolveu minha vida, os controles não ficam mais jogados no sofá.", verifiedPurchase: true, createdAt: "2026-02-14" },
  { id: "rev-7", productId: "prod-luminaria-lua", customerName: "Fernanda Dias", rating: 5, comment: "Show! O efeito da luz acesa é ainda mais bonito do que nas fotos.", verifiedPurchase: true, createdAt: "2026-08-01" },
  { id: "rev-8", productId: "prod-placa-porta", customerName: "Juliana Prado", rating: 5, comment: "Personalização perfeita, comunicação fácil pelo WhatsApp durante a produção.", verifiedPurchase: true, createdAt: "2026-05-05" },
];

export function getReviewsByProduct(productId: string) {
  return reviews.filter((r) => r.productId === productId);
}
