"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Boxes, FileText, Kanban, LayoutDashboard, LogOut, Package, Settings,
  ShoppingBag, Sparkles, Star, Tags, Ticket, Truck, Users, Wallet, X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/producao", label: "Produção", icon: Kanban },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/admin/projetos-personalizados", label: "Projetos personalizados", icon: Sparkles },
  { href: "/admin/estoque", label: "Estoque", icon: Boxes },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/avaliacoes", label: "Avaliações", icon: Star },
  { href: "/admin/fretes", label: "Fretes", icon: Truck },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar({ onNavigate, onExit }: { onNavigate?: () => void; onExit: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-graphite-900 text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo monochrome className="text-white" href="/admin" />
        <button onClick={onNavigate} className="rounded-full p-1.5 hover:bg-white/10 lg:hidden" aria-label="Fechar menu">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-accent text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={16} /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button onClick={onExit} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white">
          <LogOut size={16} /> Sair do painel
        </button>
      </div>
    </div>
  );
}
