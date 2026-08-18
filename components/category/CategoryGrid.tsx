import Link from "next/link";
import {
  Archive, Briefcase, Flower2, Gamepad2, Gift, Key, Lamp, LucideIcon,
  Monitor, Palette, Ruler, Sparkles, Users, Wand2, Wrench,
} from "lucide-react";
import type { Category } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles, "wand-2": Wand2, "gamepad-2": Gamepad2, users: Users,
  archive: Archive, key: Key, gift: Gift, wrench: Wrench, briefcase: Briefcase,
  monitor: Monitor, "flower-2": Flower2, lamp: Lamp, palette: Palette, ruler: Ruler,
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {categories.map((cat) => {
        const Icon = ICONS[cat.icon] ?? Sparkles;
        return (
          <Link
            key={cat.id}
            href={`/categorias/${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-graphite-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg hover:shadow-graphite-200/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100 text-accent transition group-hover:bg-accent group-hover:text-white">
              <Icon size={26} strokeWidth={1.8} />
            </span>
            <span className="font-display text-sm font-semibold text-ink">{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
