"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function MobileFilterDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-graphite-200 px-4 py-2 text-sm font-medium text-graphite-700 lg:hidden"
      >
        <SlidersHorizontal size={15} /> Filtros
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-sm font-semibold">Filtros</span>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-graphite-100" aria-label="Fechar filtros">
                <X size={20} />
              </button>
            </div>
            {children}
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </>
  );
}
