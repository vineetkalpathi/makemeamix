export interface MixcloudWidget {
  ready: Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (seconds: number) => Promise<boolean>;
  getPosition: () => Promise<number>;
  getDuration: () => Promise<number>;
  getIsPaused: () => Promise<boolean>;
  events: {
    play: { on: (cb: () => void) => void };
    pause: { on: (cb: () => void) => void };
    progress: { on: (cb: (position: number, duration: number) => void) => void };
    ended: { on: (cb: () => void) => void };
    error: { on: (cb: (error: unknown) => void) => void };
  };
}

declare global {
  interface Window {
    Mixcloud?: {
      PlayerWidget: (iframe: HTMLIFrameElement) => MixcloudWidget;
    };
  }
}

let widgetApiPromise: Promise<void> | null = null;

// Mixcloud doesn't expose raw stream URLs — audio must be played through
// their widget iframe so plays get reported for rights-holder royalties.
// This loads their JS API so we can drive that iframe with our own UI.
export function loadMixcloudWidgetApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Mixcloud) return Promise.resolve();
  if (widgetApiPromise) return widgetApiPromise;

  widgetApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://widget.mixcloud.com/media/js/widgetApi.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Mixcloud widget API"));
    document.body.appendChild(script);
  });

  return widgetApiPromise;
}

export function formatMixTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
