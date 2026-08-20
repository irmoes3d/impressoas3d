"use client";

import { AdminTeamManager } from "@/components/admin/AdminTeamManager";

export default function AdminEquipePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Equipe</h1>
        <p className="text-sm text-graphite-400">Administradores e funcionários com acesso ao painel.</p>
      </div>

      <AdminTeamManager />
    </div>
  );
}
