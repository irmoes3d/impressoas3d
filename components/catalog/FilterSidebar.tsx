"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categories } from "@/lib/data/categories";
import { getFilterOptions } from "@/lib/data/filters";
import { formatBRL } from "@/lib/format";

const options = getFilterOptions();

function useQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function set(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleList(key: string, value: string) {
    const current = (searchParams.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    set(key, next.length ? next.join(",") : null);
  }

  function has(key: string, value: string) {
    return (searchParams.get(key) ?? "").split(",").filter(Boolean).includes(value);
  }

  return { searchParams, set, toggleList, has };
}

export function FilterSidebar() {
  const { searchParams, set, toggleList, has } = useQuery();
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 space-y-7 lg:w-64">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink">Filtros</h2>
        <a href={pathname} className="text-xs text-graphite-400 hover:text-accent">
          Limpar tudo
        </a>
      </div>

      <FilterGroup title="Categoria">
        {categories.map((c) => (
          <Checkbox key={c.id} checked={has("categoria", c.slug)} onChange={() => toggleList("categoria", c.slug)} label={c.name} />
        ))}
      </FilterGroup>

      <FilterGroup title="Preço até">
        <input
          type="range"
          min={20}
          max={options.maxPrice}
          step={5}
          value={Number(searchParams.get("precoMax")) || options.maxPrice}
          onChange={(e) => set("precoMax", e.target.value)}
          className="w-full accent-accent"
        />
        <p className="text-xs text-graphite-400">
          Até {formatBRL(Number(searchParams.get("precoMax")) || options.maxPrice)}
        </p>
      </FilterGroup>

      <FilterGroup title="Cor">
        <div className="flex flex-wrap gap-2">
          {options.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => toggleList("cor", c.name)}
              title={c.name}
              className={`h-7 w-7 rounded-full border-2 transition ${
                has("cor", c.name) ? "border-accent scale-110" : "border-graphite-200"
              }`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Material">
        {options.materials.map((m) => (
          <Checkbox key={m} checked={has("material", m)} onChange={() => toggleList("material", m)} label={m} />
        ))}
      </FilterGroup>

      <FilterGroup title="Tamanho">
        {options.sizes.map((s) => (
          <Checkbox key={s} checked={has("tamanho", s)} onChange={() => toggleList("tamanho", s)} label={s} />
        ))}
      </FilterGroup>

      <FilterGroup title="Disponibilidade">
        <Checkbox checked={has("disponibilidade", "pronta-entrega")} onChange={() => toggleList("disponibilidade", "pronta-entrega")} label="Pronta entrega" />
        <Checkbox checked={has("disponibilidade", "sob-encomenda")} onChange={() => toggleList("disponibilidade", "sob-encomenda")} label="Produção sob encomenda" />
      </FilterGroup>

      <FilterGroup title="Outros">
        <Checkbox checked={searchParams.get("personalizados") === "1"} onChange={() => set("personalizados", searchParams.get("personalizados") === "1" ? null : "1")} label="Produtos personalizados" />
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-graphite-100 pb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-graphite-400">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-graphite-600 hover:text-ink">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded accent-accent" />
      {label}
    </label>
  );
}
