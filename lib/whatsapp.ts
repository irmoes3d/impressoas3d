const FALLBACK_NUMBER = "5511999999999";

export function getWhatsappNumber() {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_NUMBER;
}

export function buildWhatsappLink(message: string, number = getWhatsappNumber()) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_MESSAGES = {
  default: "Olá! Vim pelo site da 2 Irmãos Impressões 3D e gostaria de mais informações.",
  product: (name: string) => `Olá! Tenho interesse no produto ${name}.`,
  quote: "Olá! Gostaria de conversar sobre meu projeto de impressão 3D.",
  business: "Olá! Gostaria de solicitar um orçamento empresarial para impressão 3D.",
  order: (code: string) => `Olá! Gostaria de saber mais sobre o meu pedido ${code}.`,
};
