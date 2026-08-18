type DuckVariant = "tecnico" | "criativo";

interface DuckMascotProps {
  variant: DuckVariant;
  className?: string;
  facing?: "left" | "right";
  monochrome?: boolean;
}

/**
 * Mascote autoral: pato "técnico" (óculos de proteção, uma chave na asa) e
 * pato "criativo" (pincel/faísca, peito com losango de camadas 3D). Formas
 * geométricas simples e originais — não referencia nenhum personagem existente.
 */
export function DuckMascot({ variant, className, facing = "right", monochrome = false }: DuckMascotProps) {
  const isTecnico = variant === "tecnico";
  const accent = monochrome ? "currentColor" : isTecnico ? "var(--accent)" : "var(--sun)";
  const body = monochrome ? "currentColor" : "var(--paper)";
  const ink = monochrome ? "currentColor" : "var(--ink)";
  const flip = facing === "left" ? "scale(-1,1) translate(-120,0)" : undefined;

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={isTecnico ? "Mascote pato técnico" : "Mascote pato criativo"}
    >
      <g transform={flip}>
        {/* pé */}
        <ellipse cx="52" cy="103" rx="9" ry="4" fill={accent} opacity={monochrome ? 0.5 : 1} />
        <ellipse cx="72" cy="104" rx="9" ry="4" fill={accent} opacity={monochrome ? 0.5 : 1} />

        {/* corpo */}
        <ellipse cx="60" cy="76" rx="34" ry="27" fill={body} stroke={ink} strokeWidth="3" />
        {/* barriga */}
        <ellipse cx="58" cy="86" rx="19" ry="13" fill={accent} opacity={monochrome ? 0.15 : 0.18} />
        {/* asa */}
        <path
          d="M31 68 C 24 74, 24 90, 35 96 C 30 84, 31 75, 38 68 Z"
          fill={body}
          stroke={ink}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* cabeça */}
        <circle cx="83" cy="46" r="22" fill={body} stroke={ink} strokeWidth="3" />
        {/* bico */}
        <path
          d="M101 42 C 111 42, 114 48, 108 52 C 103 55, 96 53, 94 48 Z"
          fill={accent}
          stroke={ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M100 47 L109 47" stroke={ink} strokeWidth="1.6" opacity="0.5" />
        {/* olho */}
        <circle cx="90" cy="40" r="3.4" fill={ink} />
        <circle cx="91.2" cy="38.7" r="1" fill={body} />

        {isTecnico ? (
          <>
            {/* óculos de proteção */}
            <g stroke={ink} strokeWidth="2.5" fill={accent} fillOpacity="0.85">
              <circle cx="72" cy="30" r="7.5" />
              <circle cx="88" cy="27" r="7.5" />
              <path d="M79 29 C 81 27, 83 27, 81.5 29" fill="none" />
            </g>
            <path d="M64.5 31 C 60 24, 60 18, 66 14" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* chave inglesa na asa */}
            <g transform="translate(15,84) rotate(-25)" fill={accent} stroke={ink} strokeWidth="2">
              <rect x="0" y="9" width="22" height="5" rx="2.5" />
              <circle cx="24" cy="11.5" r="6.5" fill={body} />
              <path d="M24 11.5 m -6.5 0 a 6.5 6.5 0 0 1 13 0" fill="none" />
            </g>
          </>
        ) : (
          <>
            {/* faísca criativa acima da cabeça */}
            <g fill={accent} stroke={ink} strokeWidth="1.5" strokeLinejoin="round">
              <path d="M83 8 L86 15 L93 17 L86 19 L83 26 L80 19 L73 17 L80 15 Z" />
            </g>
            {/* pincel na asa */}
            <g transform="translate(14,80) rotate(-20)">
              <rect x="0" y="0" width="6" height="16" rx="2" fill="#caa06b" stroke={ink} strokeWidth="1.5" />
              <rect x="0" y="14" width="6" height="7" rx="1.5" fill={ink} />
              <path d="M0 21 Q3 30 6 21 Z" fill={accent} stroke={ink} strokeWidth="1.4" />
            </g>
          </>
        )}
      </g>
    </svg>
  );
}
