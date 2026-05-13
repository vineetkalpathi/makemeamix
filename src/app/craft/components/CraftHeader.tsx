import { Vinyl } from "@/app/_components/Vinyl";
import { durationLabel } from "../utils/time";

interface CraftHeaderProps {
  filled: number;
  total: number;
  totalDuration: number;
}

export function CraftHeader({ filled, total, totalDuration }: CraftHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow">Cue Sheet · Side A</span>
          <h1 style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
            A mix, <em className="serif-i text-accent">taking shape</em>.
          </h1>
          <p
            className="text-ink-soft m-0 max-w-[520px]"
            style={{ fontSize: 17, lineHeight: 1.5 }}
          >
            Lay your tracks out left to right. Trim the bits you love, leave notes for how they
            should meet.
          </p>
        </div>
        <div
          className="flex items-stretch border"
          style={{
            gap: 22,
            padding: "16px 22px",
            background: "var(--surface)",
            borderColor: "var(--hairline)",
            borderRadius: "var(--r-lg)",
          }}
        >
          <div className="flex flex-col gap-1">
            <span className="caption">Tracks</span>
            <span className="serif tabular-nums" style={{ fontSize: 32, lineHeight: 1 }}>
              {filled}
              <span className="text-ink-mute">/{total}</span>
            </span>
          </div>
          <div style={{ width: 1, background: "var(--hairline)" }} />
          <div className="flex flex-col gap-1">
            <span className="caption">Run time</span>
            <span className="serif tabular-nums" style={{ fontSize: 32, lineHeight: 1 }}>
              {durationLabel(totalDuration)}
            </span>
          </div>
          <div className="relative flex items-center">
            <Vinyl size={42} spinning={filled > 0} />
          </div>
        </div>
      </div>
    </header>
  );
}
