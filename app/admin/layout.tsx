"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/lib/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const router = useRouter();

  function exitAdmin() {
    signOut();
    router.push("/");
  }

  return (
    <AdminGate>
      <div className="min-h-screen bg-graphite-100/40 lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-0 h-screen">
            <AdminSidebar onExit={exitAdmin} />
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72">
              <AdminSidebar onNavigate={() => setOpen(false)} onExit={exitAdmin} />
            </div>
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-3 border-b border-graphite-200 bg-white px-4 py-3 lg:hidden">
            <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="rounded-lg p-1.5 hover:bg-graphite-100">
              <Menu size={20} />
            </button>
            <span className="font-display text-sm font-semibold text-ink">Painel administrativo</span>
          </div>
          <main className="p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminGate>
  );
}
