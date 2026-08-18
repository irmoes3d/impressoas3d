import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "cat-decoracao", slug: "decoracao", name: "Decoração", description: "Peças autorais para dar personalidade a qualquer ambiente.", icon: "sparkles" },
  { id: "cat-geek", slug: "geek", name: "Geek", description: "Itens de séries, filmes e cultura pop impressos em alta definição.", icon: "wand-2" },
  { id: "cat-games", slug: "games", name: "Games", description: "Suportes, troféus e réplicas para quem vive o universo dos games.", icon: "gamepad-2" },
  { id: "cat-miniaturas", slug: "miniaturas", name: "Miniaturas", description: "Miniaturas detalhadas para colecionar, jogar ou presentear.", icon: "users" },
  { id: "cat-organizadores", slug: "organizadores", name: "Organizadores", description: "Soluções inteligentes para organizar casa, mesa e ferramentas.", icon: "archive" },
  { id: "cat-chaveiros", slug: "chaveiros", name: "Chaveiros", description: "Chaveiros personalizados com nome, cor e acabamento à sua escolha.", icon: "key" },
  { id: "cat-presentes", slug: "presentes", name: "Presentes", description: "Ideias de presente únicas, impossíveis de encontrar prontas.", icon: "gift" },
  { id: "cat-utilidades", slug: "utilidades", name: "Utilidades", description: "Peças práticas do dia a dia, feitas sob medida para resolver.", icon: "wrench" },
  { id: "cat-escritorio", slug: "escritorio", name: "Escritório", description: "Organização e estilo para sua mesa de trabalho ou home office.", icon: "briefcase" },
  { id: "cat-suportes", slug: "suportes", name: "Suportes", description: "Suportes para celular, headset, controle, ferramentas e mais.", icon: "monitor" },
  { id: "cat-vasos", slug: "vasos", name: "Vasos", description: "Vasos geométricos e autoportantes para plantas de todos os tamanhos.", icon: "flower-2" },
  { id: "cat-luminarias", slug: "luminarias", name: "Luminárias", description: "Luminárias com jogos de camadas e luz que viram peça central.", icon: "lamp" },
  { id: "cat-personalizadas", slug: "personalizadas", name: "Peças personalizadas", description: "Qualquer peça do catálogo, do seu jeito: cor, nome e tamanho.", icon: "palette" },
  { id: "cat-sob-medida", slug: "sob-medida", name: "Projetos sob medida", description: "Envie sua ideia ou arquivo 3D e nós fabricamos para você.", icon: "ruler" },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
