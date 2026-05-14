export function trimLink(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `youtu.be${u.pathname}`;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `youtu.be/${v}` : url;
    }
    return u.hostname + u.pathname;
  } catch {
    return url;
  }
}
