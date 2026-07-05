export interface ExampleMix {
  id: string;
  title: string;
  artist: string;
  description: string;
  // Mixcloud "feed" path for the upload, e.g. "/username/mix-slug/".
  feedPath: string;
}

// Placeholder content pulled from public Mixcloud shows so the player works
// end to end in dev. Swap these for your own uploads before launch.
export const EXAMPLE_MIXES: ExampleMix[] = [
  {
    id: "radio-raheem",
    title: "Black Sugar — Puntata 01",
    artist: "Radio Raheem Milano",
    description: "A slow-building open-format set — the kind of pacing we aim for on a sangeet.",
    feedPath: "/radioraheem_milano/black-sugar-puntata-01/",
  },
];
