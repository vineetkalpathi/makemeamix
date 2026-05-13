export function Vinyl({
  size = 80,
  label,
  spinning = false,
  className = "",
}: {
  size?: number;
  label?: string;
  spinning?: boolean;
  className?: string;
}) {
  const grooves = Array.from({ length: 9 }, (_, i) => 22 + i * 3.4);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className} ${spinning ? "vinyl-spin" : ""}`}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="49" fill="var(--ink)" />
      {grooves.map((r, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="color-mix(in oklch, var(--ink-mute) 60%, transparent)"
          strokeWidth="0.4"
          opacity={0.55}
        />
      ))}
      <circle cx="50" cy="50" r="14" fill="var(--accent)" />
      <circle cx="50" cy="50" r="2" fill="var(--paper)" />
      {label ? (
        <text
          x="50"
          y="52"
          textAnchor="middle"
          fontSize="4.4"
          fontFamily="var(--font-mono)"
          letterSpacing="0.4"
          fill="var(--paper)"
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
}

export function MarkLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="18" cy="22" r="14" fill="var(--ink)" />
      <circle
        cx="18"
        cy="22"
        r="10"
        fill="none"
        stroke="color-mix(in oklch, var(--ink-faint) 70%, transparent)"
        strokeWidth="0.5"
      />
      <circle
        cx="18"
        cy="22"
        r="7"
        fill="none"
        stroke="color-mix(in oklch, var(--ink-faint) 70%, transparent)"
        strokeWidth="0.5"
      />
      <circle cx="18" cy="22" r="4.2" fill="var(--accent)" />
      <circle cx="18" cy="22" r="0.8" fill="var(--paper)" />
      <g stroke="var(--ink-soft)" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <line x1="32" y1="6" x2="22" y2="18" />
        <circle cx="33" cy="5" r="2.2" fill="var(--ink-soft)" stroke="none" />
      </g>
    </svg>
  );
}

export function GrooveDisc({
  size = 720,
  style,
}: {
  size?: number;
  style?: React.CSSProperties;
}) {
  const r = size / 2;
  const grooves: number[] = [];
  for (let i = 14; i < r - 4; i += 3.4) grooves.push(i);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={style}
      aria-hidden="true"
    >
      <circle cx={r} cy={r} r={r - 1} fill="none" stroke="var(--hairline-strong)" strokeWidth="0.6" />
      {grooves.map((g, i) => (
        <circle key={i} cx={r} cy={r} r={g} fill="none" stroke="var(--hairline)" strokeWidth="0.5" />
      ))}
      <circle cx={r} cy={r} r={size * 0.085} fill="none" stroke="var(--accent)" strokeWidth="0.8" opacity="0.5" />
      <circle cx={r} cy={r} r="3.4" fill="var(--accent)" />
    </svg>
  );
}

export function PlaceholderVinyl({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 320 320" style={style} aria-hidden="true">
      <g stroke="var(--ink)" strokeWidth="1.2" fill="none">
        <circle cx="160" cy="170" r="120" fill="var(--ink)" />
        {Array.from({ length: 14 }).map((_, i) => (
          <circle
            key={i}
            cx="160"
            cy="170"
            r={40 + i * 5.5}
            stroke="color-mix(in oklch, var(--ink-faint) 50%, transparent)"
            strokeWidth="0.5"
          />
        ))}
        <circle cx="160" cy="170" r="36" fill="var(--accent)" stroke="var(--accent)" />
        <circle cx="160" cy="170" r="3.5" fill="var(--paper)" stroke="var(--paper)" />
        <line x1="260" y1="58" x2="194" y2="138" stroke="var(--ink-soft)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="263" cy="55" r="7" fill="var(--ink-soft)" stroke="var(--ink-soft)" />
        <circle cx="190" cy="142" r="4" fill="var(--ink-soft)" stroke="var(--ink-soft)" />
      </g>
    </svg>
  );
}
