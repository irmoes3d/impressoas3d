// Cálculo de frete simulado. Ponto de integração real: Correios (SIGEP/API) ou
// Melhor Envio (https://docs.melhorenvio.com.br) — troque calculateShipping()
// por uma chamada a essas APIs usando o CEP de origem da loja e o peso/dimensões
// reais do carrinho. Mantemos a mesma assinatura de retorno para não quebrar o checkout.

export interface ShippingOption {
  id: string;
  carrier: string;
  service: string;
  cost: number;
  deadlineDays: number;
}

export function calculateShipping(cep: string, weightGrams: number): ShippingOption[] {
  const digits = cep.replace(/\D/g, "");
  const region = Number(digits.slice(0, 1)) || 0;
  const baseByRegion = [22, 24, 26, 28, 25, 27, 30, 32, 21, 23][region] ?? 28;
  const weightFactor = Math.max(0, (weightGrams - 200) / 1000) * 6;

  const pac = Math.round((baseByRegion + weightFactor) * 100) / 100;
  const sedex = Math.round((baseByRegion * 1.7 + weightFactor) * 100) / 100;

  return [
    { id: "pac", carrier: "Correios", service: "PAC", cost: pac, deadlineDays: 8 + region },
    { id: "sedex", carrier: "Correios", service: "SEDEX", cost: sedex, deadlineDays: 3 + Math.min(region, 3) },
    { id: "transportadora", carrier: "Melhor Envio", service: "Jadlog .Package", cost: Math.round((pac * 0.85) * 100) / 100, deadlineDays: 7 + region },
  ];
}
