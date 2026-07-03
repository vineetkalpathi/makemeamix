---
name: youtube-api
description: >
  Reference skill for the YouTube iFrame Player API used in this project (makemeamix).
  Use this skill whenever the user asks about: the YouTube player, iFrame API methods or events,
  playerVars options, player state codes, seekTo/playVideo/pauseVideo behavior, the YTPlayer
  interface, react-youtube integration, autoplay restrictions, or anything touching the
  YouTubePreview component or youtube.ts utilities. Trigger even if the user phrases it as
  a general JavaScript/TypeScript question if it's clearly about the YouTube player in context.
---

# YouTube iFrame Player API — Project Reference

This project uses the YouTube iFrame Player API via the `react-youtube` wrapper. The main files are:

| File | Purpose |
|---|---|
| `src/app/craft/components/YouTubePreview.tsx` | Embeds the player, handles play/pause/seek/loop, fires time ticks via `requestAnimationFrame` |
| `src/lib/utils/youtube.ts` | URL parsing and validation utilities (does not touch the player API directly) |

## How the project uses the API

- **Wrapper**: `react-youtube` (`<YouTube>` component). It creates the `YT.Player` under the hood and exposes it via `event.target` in the `onReady` callback.
- **Player reference**: stored in `internalRef` (`useRef<YTPlayer | null>`) after `onReady` fires.
- **Time polling**: uses `requestAnimationFrame` loop calling `getCurrentTime()` — not the API's event system — for sub-second accuracy needed for the clip trim UI.
- **Loop/end logic**: when `getCurrentTime() >= endTime`, either seeks back to `startTime` (loop mode) or calls `pauseVideo()`.
- **State sync**: `onStateChange` maps state codes `1 → playing`, `2|0 → paused` back to React state.

## playerVars used in this project

```ts
{
  controls: 0,       // hide native YouTube controls
  disablekb: 1,      // disable keyboard shortcuts
  modestbranding: 1, // reduce YouTube branding
  rel: 0,            // don't show related videos at end
  iv_load_policy: 3, // hide video annotations
  playsinline: 1,    // play inline on iOS instead of fullscreen
}
```

## The YTPlayer interface (local type)

```ts
interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}
```

This is a minimal local type. The full API has many more methods — see `references/iframe-api.md`.

---

## When answering questions

1. Check `references/iframe-api.md` for the complete API (all methods, events, player states, error codes).
2. Cross-reference the local `YTPlayer` interface and `playerVars` above — the project only exposes a subset of the full API.
3. If the question involves adding a new player capability (e.g. volume, playback rate), look up the relevant method in the reference doc and show how to add it to the `YTPlayer` interface and use it via `internalRef.current`.
4. Watch for autoplay issues — browsers block `playVideo()` without prior user gesture. The `onAutoplayBlocked` event fires in that case.
