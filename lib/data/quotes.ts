import type { CustomQuote } from "@/lib/types";

export const quotes: CustomQuote[] = [
  {
    id: "q-1", name: "Renata Costa", whatsapp: "(11) 98888-1111", email: "renata.costa@gmail.com",
    description: "Preciso de uma réplica em miniatura da minha casa para dar de presente para meus pais no aniversário de casamento.",
    quantity: 1, approxSize: "20 x 20 x 15 cm", color: "Branco e telhado marrom", material: "PLA+",
    desiredDeadline: "Até 30 dias", files: [{ id: "f1", name: "referencia-casa.jpg", sizeKb: 820, type: "image/jpeg" }],
    status: "em_analise", createdAt: "2026-07-20", estimatedPrice: 320,
  },
  {
    id: "q-2", name: "Estúdio Verve", whatsapp: "(11) 97777-2222", email: "contato@estudioverve.com",
    description: "Precisamos de 50 troféus personalizados para um evento de premiação de designers.",
    quantity: 50, approxSize: "15 x 8 x 8 cm", color: "Preto e dourado", material: "PLA+",
    desiredDeadline: "20 dias", files: [{ id: "f2", name: "briefing-evento.pdf", sizeKb: 1450, type: "application/pdf" }],
    status: "orcamento_enviado", createdAt: "2026-07-15", estimatedPrice: 3200,
  },
  {
    id: "q-3", name: "Thiago Nogueira", whatsapp: "(21) 96666-3333", email: "thiago.nogueira@gmail.com",
    description: "Quero uma peça de reposição para o meu aspirador de pó, a original quebrou.",
    quantity: 1, approxSize: "8 x 4 x 2 cm", color: "Preto", material: "PETG",
    desiredDeadline: "Sem pressa", files: [{ id: "f3", name: "peca-quebrada.stl", sizeKb: 240, type: "model/stl" }],
    status: "aprovado", createdAt: "2026-07-05", estimatedPrice: 45,
  },
  {
    id: "q-4", name: "Camila Ortiz", whatsapp: "(31) 95555-4444", email: "camila.ortiz@gmail.com",
    description: "Ideia de luminária personalizada com o nome da minha filha para o quarto dela.",
    quantity: 1, approxSize: "12 x 12 x 18 cm", color: "Rosa e branco", material: "PLA translúcido",
    desiredDeadline: "15 dias", files: [], status: "novo", createdAt: "2026-08-03",
  },
];
