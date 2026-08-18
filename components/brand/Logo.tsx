import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  className?: string;
  href?: string | null;
  priority?: boolean;
}

export function Logo({ size = 44, className = "", href = "/", priority = false }: LogoProps) {
  const image = (
    <Image
      src="/brand/logo.png"
      alt="2 Irmãos Impressões 3D"
      width={size}
      height={size}
      priority={priority}
      className="shrink-0 rounded-xl object-contain"
    />
  );

  if (!href) return <span className={className}>{image}</span>;

  return (
    <Link href={href} className={`inline-flex items-center ${className}`} aria-label="2 Irmãos Impressões 3D — início">
      {image}
    </Link>
  );
}
