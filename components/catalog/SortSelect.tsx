"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "vendidos", label: "Mais vendidos" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "novidades", label: "Novidades" },
  { value: "avaliados", label: "Melhor avaliados" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={searchParams.get("ordenar") ?? "vendidos"}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("ordenar", e.target.value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }}
      className="rounded-full border border-graphite-200 bg-white px-4 py-2 text-sm font-medium text-graphite-700 outline-none focus:border-accent"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          Ordenar: {o.label}
        </option>
      ))}
    </select>
  );
}
