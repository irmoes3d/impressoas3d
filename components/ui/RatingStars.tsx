import { Star } from "lucide-react";

export function RatingStars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(value);
        return (
          <Star
            key={i}
            size={size}
            className={filled ? "fill-sun text-sun" : "fill-graphite-100 text-graphite-200"}
          />
        );
      })}
    </div>
  );
}
