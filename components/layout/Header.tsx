"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/lib/context/CartContext";
import { useFavorites } from "@/lib/context/FavoritesContext";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/categorias", label: "Categorias" },
  { href: "/personalizados", label: "Personalizados" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const { count } = useCart();
  const { ids } = useFavorites();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/produtos?busca=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-graphite-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-graphite-600 transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            aria-label="Buscar"
            onClick={() => setSearchOpen((v) => !v)}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-graphite-600 transition hover:bg-graphite-100 sm:flex"
          >
            <Search size={19} />
          </button>
          <Link
            href="/conta"
            aria-label="Minha conta"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-graphite-600 transition hover:bg-graphite-100 sm:flex"
          >
            <User size={19} />
          </Link>
          <Link
            href="/conta/favoritos"
            aria-label="Favoritos"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-graphite-600 transition hover:bg-graphite-100 sm:flex"
          >
            <Heart size={19} />
            {ids.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {ids.length}
              </span>
            )}
          </Link>
          <Link
            href="/carrinho"
            aria-label="Carrinho"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-graphite-600 transition hover:bg-graphite-100"
          >
            <ShoppingCart size={19} />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <Link
            href="/personalizados"
            className="ml-2 hidden items-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 xl:inline-flex"
          >
            Peça seu projeto personalizado
          </Link>

          <button
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-graphite-600 hover:bg-graphite-100 lg:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-graphite-100 bg-white">
          <form onSubmit={submitSearch} className="container-page flex items-center gap-2 py-3">
            <Search size={18} className="text-graphite-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos, categorias..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-graphite-400"
            />
            <button type="submit" className="text-sm font-semibold text-accent">
              Buscar
            </button>
          </form>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col gap-1 bg-white p-5 shadow-2xl animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <Logo />
              <button aria-label="Fechar menu" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-graphite-100">
                <X size={20} />
              </button>
            </div>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-graphite-700 hover:bg-graphite-100"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-graphite-100" />
            <Link href="/conta" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium text-graphite-700 hover:bg-graphite-100">
              Minha conta
            </Link>
            <Link href="/conta/favoritos" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium text-graphite-700 hover:bg-graphite-100">
              Favoritos ({ids.length})
            </Link>
            <Link
              href="/personalizados"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white"
            >
              Peça seu projeto personalizado
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
