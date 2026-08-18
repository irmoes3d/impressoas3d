"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, User as UserIcon, FileText } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { AuthForms } from "@/components/account/AuthForms";

const NAV = [
  { href: "/conta", label: "Visão geral", icon: LayoutDashboard },
  { href: "/conta/pedidos", label: "Meus pedidos", icon: Package },
  { href: "/conta/dados", label: "Dados pessoais", icon: UserIcon },
  { href: "/conta/enderecos", label: "Endereços", icon: MapPin },
  { href: "/conta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/conta/orcamentos", label: "Orçamentos", icon: FileText },
];

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading) {
    return <div className="container-page py-24 text-center text-sm text-graphite-400">Carregando...</div>;
  }

  if (!user) return <AuthForms />;

  const name = profile?.name || (user.user_metadata?.name as string) || user.email?.split("@")[0] || "cliente";

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-2xl font-bold text-ink">Olá, {name}</h1>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                pathname === item.href ? "bg-ink text-white" : "text-graphite-600 hover:bg-graphite-100"
              }`}
            >
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger/10"
          >
            <LogOut size={16} /> Sair
          </button>
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
