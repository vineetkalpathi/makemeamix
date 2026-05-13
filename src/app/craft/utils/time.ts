export function formatTime(seconds: number): string {
  if (typeof seconds !== "number" || isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.floor(Math.max(0, seconds) % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function parseTimeInput(input: string): number {
  if (!input) return 0;
  const trimmed = String(input).trim();
  if (trimmed.includes(":")) {
    const [m, s] = trimmed.split(":");
    return Math.max(0, (parseInt(m || "0", 10) || 0) * 60 + (parseInt(s || "0", 10) || 0));
  }
  return Math.max(0, parseInt(trimmed, 10) || 0);
}

export function durationLabel(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h) return `${h}h ${m}m ${s.toString().padStart(2, "0")}s`;
  if (m) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}
