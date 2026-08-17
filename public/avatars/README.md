# Self-hosted agent avatars

Character art we own, served by the app itself from `/avatars/<file>`
(`express.static` on `app/src/public`, wired at `app/src/server.js:342`).

Use these for any agent that has no Higgsfield cutout. The seven original
minions and Herme are still hot-linked to `d8j0ntlcm91z4.cloudfront.net` — a
third-party bucket under someone else's user path, listed as a known risk in
`app/README.md`. Nothing new should be added there.

| File | Agent | Notes |
|---|---|---|
| `koderis.svg` | `koderis` (KODERIS, the coding minion) | Flat vector, no fonts, no external refs. 200x400 viewBox so `height:100% / width:auto` keeps him in scale with the photographic cutouts. |

## Adding one

1. Drop an SVG (or PNG) here. Keep the same tall aspect ratio as the cutouts.
2. Point the agent row at it: `cutout_url = '/avatars/<file>'`.
   Seed rows live in `app/supabase/seed-agents.sql`; a live change goes through
   the control panel / an `admin_*` RPC, never a direct public write.
3. No `video_url` is required — the profile modal falls back to the still
   avatar when the agent has no character video.

An agent with **no** `cutout_url` at all is not hidden either: the field draws a
lettered placeholder (`.figure-ph`) so a new minion still anchors in place.
