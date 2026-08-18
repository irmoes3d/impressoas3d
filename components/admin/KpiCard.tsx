import type { LucideIcon } from "lucide-react";

export function KpiCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-graphite-100 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-100 text-accent">
          <Icon size={17} />
        </span>
      </div>
      <p className="font-display text-xl font-bold text-ink">{value}</p>
      <p className="text-xs text-graphite-400">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-ok">{hint}</p>}
    </div>
  );
}
