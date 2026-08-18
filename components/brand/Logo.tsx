import Link from "next/link";
import { DuckMascot } from "./DuckMascot";

interface LogoProps {
  variant?: "full" | "mark" | "stacked";
  monochrome?: boolean;
  className?: string;
  href?: string | null;
}

export function Logo({ variant = "full", monochrome = false, className = "", href = "/" }: LogoProps) {
  const marks = (
    <span className="flex -space-x-3 shrink-0">
      <DuckMascot variant="criativo" facing="right" monochrome={monochrome} className="h-10 w-10" />
      <DuckMascot variant="tecnico" facing="left" monochrome={monochrome} className="h-10 w-10" />
    </span>
  );

  const wordmark = (
    <span className="leading-none">
      <span
        className={`block font-display font-bold tracking-tight ${
          monochrome ? "text-current" : "text-ink"
        } text-lg`}
      >
        2 Irmãos
      </span>
      <span
        className={`block text-[11px] font-medium uppercase tracking-[0.16em] ${
          monochrome ? "text-current opacity-70" : "text-accent"
        }`}
      >
        Impressões 3D
      </span>
    </span>
  );

  const content =
    variant === "mark" ? (
      marks
    ) : variant === "stacked" ? (
      <span className="flex flex-col items-center gap-2 text-center">
        {marks}
        {wordmark}
      </span>
    ) : (
      <span className="flex items-center gap-3">
        {marks}
        {wordmark}
      </span>
    );

  if (!href) return <span className={className}>{content}</span>;

  return (
    <Link href={href} className={`inline-flex items-center ${className}`} aria-label="2 Irmãos Impressões 3D — início">
      {content}
    </Link>
  );
}
