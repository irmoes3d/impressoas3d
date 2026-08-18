export interface GalleryItem {
  id: string;
  seed: string;
  alt: string;
  category: "personalizados" | "decoracao" | "geek" | "empresas" | "presentes" | "especiais";
  ratio: number;
}

const cats: GalleryItem["category"][] = ["personalizados", "decoracao", "geek", "empresas", "presentes", "especiais"];

export const galleryCategories: { value: GalleryItem["category"] | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "personalizados", label: "Personalizados" },
  { value: "decoracao", label: "Decoração" },
  { value: "geek", label: "Geek" },
  { value: "empresas", label: "Empresas" },
  { value: "presentes", label: "Presentes" },
  { value: "especiais", label: "Projetos especiais" },
];

export const galleryItems: GalleryItem[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `gal-${i}`,
  seed: `galeria-${i}`,
  alt: `Projeto ${i + 1} produzido pela 2 Irmãos Impressões 3D`,
  category: cats[i % cats.length],
  ratio: [1, 1.3, 0.8, 1.15][i % 4],
}));
