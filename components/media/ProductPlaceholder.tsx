import {
  Archive,
  Briefcase,
  Flower2,
  Gamepad2,
  Gift,
  Key,
  Lamp,
  LucideIcon,
  Monitor,
  Palette,
  Ruler,
  Sparkles,
  Users,
  Wand2,
  Wrench,
  Box,
} from "lucide-react";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  decoracao: Sparkles,
  geek: Wand2,
  games: Gamepad2,
  miniaturas: Users,
  organizadores: Archive,
  chaveiros: Key,
  presentes: Gift,
  utilidades: Wrench,
  escritorio: Briefcase,
  suportes: Monitor,
  vasos: Flower2,
  luminarias: Lamp,
  personalizadas: Palette,
  "sob-medida": Ruler,
};

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const PALETTES = [
  ["#2f5bff", "#e8edff"],
  ["#ff8a1e", "#fff1e2"],
  ["#14171b", "#e3e5e8"],
  ["#7c3aed", "#efe6ff"],
  ["#16a34a", "#e5f7ec"],
];

interface ProductPlaceholderProps {
  seed: string;
  alt: string;
  categorySlug?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Ilustração gerada (sem fotos reais): camadas concêntricas inspiradas em impressão 3D. */
export function ProductPlaceholder({ seed, alt, categorySlug, className, style }: ProductPlaceholderProps) {
  const h = hashSeed(seed);
  const [accent, tint] = PALETTES[h % PALETTES.length];
  const rotate = h % 24;
  const Icon = (categorySlug && CATEGORY_ICON[categorySlug]) || Box;
  const layers = 5 + (h % 4);

  return (
    <svg viewBox="0 0 400 400" className={className} style={style} role="img" aria-label={alt}>
      <rect width="400" height="400" fill={tint} />
      <g transform={`translate(200 200) rotate(${rotate})`}>
        {Array.from({ length: layers }).map((_, i) => {
          const size = 150 - i * (110 / layers);
          return (
            <rect
              key={i}
              x={-size / 2}
              y={-size / 2}
              width={size}
              height={size}
              rx={18}
              fill="none"
              stroke={accent}
              strokeOpacity={0.16 + (i / layers) * 0.5}
              strokeWidth={3}
            />
          );
        })}
      </g>
      <g className="layer-lines" opacity="0.35">
        <rect width="400" height="400" fill="transparent" />
      </g>
      <circle cx="200" cy="200" r="46" fill={accent} />
      <foreignObject x="168" y="168" width="64" height="64">
        <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon color="white" size={30} strokeWidth={1.8} />
        </div>
      </foreignObject>
    </svg>
  );
}
