# YouTube iFrame Player API — Full Reference

Source: https://developers.google.com/youtube/iframe_api_reference

---

## Loading the API

```html
<script src="https://www.youtube.com/iframe_api"></script>
```

The page must implement `onYouTubeIframeAPIReady()` which fires when the API is ready.
`react-youtube` handles this automatically.

---

## Constructor

```javascript
new YT.Player(elementOrId, options)
```

**Options:**

| Field | Type | Description |
|---|---|---|
| `width` | number | iframe width (default: 640) |
| `height` | number | iframe height (default: 390) |
| `videoId` | string | YouTube video ID to load |
| `playerVars` | object | Player customization (see below) |
| `events` | object | Event handler mappings |

---

## playerVars

| Parameter | Values | Description |
|---|---|---|
| `autoplay` | 0, 1 | Auto-play on load (often blocked by browsers) |
| `cc_lang_pref` | string | Default caption language (e.g. `"en"`) |
| `cc_load_policy` | 1 | Force captions on by default |
| `color` | `"red"`, `"white"` | Progress bar color |
| `controls` | 0, 1, 2 | Show/hide player controls |
| `disablekb` | 0, 1 | Disable keyboard shortcuts |
| `enablejsapi` | 0, 1 | Enable JS API (required for API calls from a different origin) |
| `end` | number | Stop playback at this time (seconds) |
| `fs` | 0, 1 | Show fullscreen button |
| `hl` | string | Player UI language |
| `iv_load_policy` | 1, 3 | Show (1) or hide (3) video annotations |
| `list` | string | Playlist or search query (with `listType`) |
| `listType` | `"playlist"`, `"user_uploads"` | Type for `list` |
| `loop` | 0, 1 | Loop single video or playlist |
| `modestbranding` | 1 | Reduce YouTube logo prominence |
| `origin` | string | Your domain (required for `enablejsapi` on cross-origin) |
| `playlist` | string | Comma-separated list of video IDs to play after initial video |
| `playsinline` | 0, 1 | Play inline (1) or fullscreen (0) on iOS |
| `rel` | 0, 1 | Show related videos at end (0 = same channel only since Sept 2018) |
| `start` | number | Start playback at this time (seconds) |
| `widget_referrer` | string | URL used in YouTube Analytics |

---

## Playback Methods

| Method | Description |
|---|---|
| `playVideo()` | Plays the loaded/cued video |
| `pauseVideo()` | Pauses the playing video |
| `stopVideo()` | Stops playback and cancels video load |
| `seekTo(seconds, allowSeekAhead)` | Seeks to `seconds`. `allowSeekAhead=true` makes a server request if needed to seek past buffered content |
| `nextVideo()` | Loads next video in playlist |
| `previousVideo()` | Loads previous video in playlist |
| `playVideoAt(index)` | Plays the video at `index` in the playlist |

---

## Video Queueing Methods

| Method | Description |
|---|---|
| `cueVideoById(videoId, startSeconds, endSeconds)` | Loads but does not play |
| `loadVideoById(videoId, startSeconds, endSeconds)` | Loads and plays |
| `cueVideoByUrl(mediaContentUrl, startSeconds, endSeconds)` | Same as above but uses a URL |
| `loadVideoByUrl(mediaContentUrl, startSeconds, endSeconds)` | Same as above but uses a URL |

Object form also accepted: `cueVideoById({ videoId, startSeconds, endSeconds, suggestedQuality })`

---

## Playlist Methods

| Method | Description |
|---|---|
| `cuePlaylist(playlist, index, startSeconds)` | Queues playlist |
| `loadPlaylist(playlist, index, startSeconds)` | Loads and plays playlist |
| `setLoop(loopPlaylists)` | Whether playlist loops continuously |
| `setShuffle(shufflePlaylist)` | Whether playlist plays in random order |
| `getPlaylist()` | Returns array of video IDs in the playlist |
| `getPlaylistIndex()` | Returns index of current video in playlist |

---

## Volume Methods

| Method | Description |
|---|---|
| `mute()` | Mutes the player |
| `unMute()` | Unmutes the player |
| `isMuted()` | Returns `true` if muted |
| `setVolume(volume)` | Sets volume 0–100 |
| `getVolume()` | Returns current volume 0–100 |

---

## Playback Rate

| Method | Description |
|---|---|
| `getPlaybackRate()` | Returns current rate (e.g. 1, 1.5, 2) |
| `setPlaybackRate(rate)` | Sets rate — change not guaranteed; fires `onPlaybackRateChange` if it changes |
| `getAvailablePlaybackRates()` | Returns array of supported rates |

---

## Player State Methods

| Method | Description |
|---|---|
| `getPlayerState()` | Returns current player state (see states below) |
| `getCurrentTime()` | Returns elapsed playback time in seconds |
| `getDuration()` | Returns video duration in seconds (0 if not loaded) |
| `getVideoLoadedFraction()` | Returns 0–1 fraction of video buffered |
| `getVideoUrl()` | Returns the YouTube.com URL of the current video |
| `getVideoEmbedCode()` | Returns HTML embed code string |

---

## Player States

Accessible as `YT.PlayerState.<NAME>` or as raw numbers:

| Constant | Value | Meaning |
|---|---|---|
| `UNSTARTED` | -1 | Player initialized, no video loaded yet |
| `ENDED` | 0 | Video finished playing |
| `PLAYING` | 1 | Currently playing |
| `PAUSED` | 2 | Paused |
| `BUFFERING` | 3 | Buffering |
| `CUED` | 5 | Video cued (ready to play but not started) |

**Project usage in `onStateChange`:**
```ts
const onStateChange = (e: { data: number }) => {
  if (e.data === 1) setIsPlaying(true);        // PLAYING
  if (e.data === 2 || e.data === 0) setIsPlaying(false); // PAUSED or ENDED
};
```

---

## Player Size & DOM

| Method | Description |
|---|---|
| `setSize(width, height)` | Resizes the iframe |
| `getIframe()` | Returns the iframe DOM element |
| `destroy()` | Removes the iframe and cleans up |

---

## Events

Register via `events` option in constructor or via `addEventListener(event, listener)`.

| Event | `event.data` value | Description |
|---|---|---|
| `onReady` | (event object with `.target`) | Player is ready for API calls |
| `onStateChange` | State number (see above) | Player state changed |
| `onPlaybackQualityChange` | `'small'`, `'medium'`, `'large'`, `'hd720'`, `'hd1080'`, `'highres'` | Video quality changed |
| `onPlaybackRateChange` | number (new rate) | Playback speed changed |
| `onError` | Error code (see below) | Error occurred |
| `onApiChange` | — | A module was loaded or unloaded |
| `onAutoplayBlocked` | — | Browser blocked autoplay |

**Error codes for `onError`:**

| Code | Meaning |
|---|---|
| 2 | Invalid parameter value |
| 5 | HTML5 player error |
| 100 | Video not found or private |
| 101 | Owner has disabled embedding |
| 150 | Same as 101 |

---

## 360° Video

| Method | Description |
|---|---|
| `getSphericalProperties()` | Returns `{ yaw, pitch, roll, fov, enableOrientationSensor }` |
| `setSphericalProperties(props)` | Sets viewing perspective for 360° content |

Note: limited/distorted on unsupported mobile devices.

---

## Caption Control

| Method | Description |
|---|---|
| `getOption(module, option)` | Gets a module setting (e.g. `getOption('captions', 'track')`) |
| `setOption(module, option, value)` | Sets a module setting |

---

## Event Listener Management

| Method | Description |
|---|---|
| `addEventListener(event, listener)` | Adds a listener for a named event |
| `removeEventListener(event, listener)` | Removes a previously added listener |

---

## Browser Requirements

- Must support HTML5 `postMessage`
- Minimum iframe size: 200×200px
- Recommended for 16:9 aspect ratio: ≥480×270px

---

## Important Caveats

- **Autoplay**: `playVideo()` called without a prior user gesture is often blocked by browsers. `onAutoplayBlocked` fires when this happens.
- **`getDuration()`**: Returns 0 until video metadata is loaded. Call it inside `onReady` or after.
- **`seekTo(seconds, allowSeekAhead)`**: Pass `allowSeekAhead: true` to seek past the buffered region (makes a network request). `false` limits seek to buffered content.
- **`setPlaybackRate`**: Not guaranteed to succeed. Listen to `onPlaybackRateChange` to confirm.
- **View counts**: Only increment from native player button clicks, not API-triggered plays.
- **Search results**: `listType: 'search'` was deprecated November 15, 2020.
