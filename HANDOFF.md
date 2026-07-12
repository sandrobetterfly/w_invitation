# HANDOFF — Wedding Invitation (Sandro & Kopi)

> **Session snapshot · 2026-06-27 · baseline commit `57ddf48` (countdown removed).**
> *(One in-progress tweak not yet committed: `/details` top-bar text switched from
> coral to white for contrast on the blue bar.)*
> This is a point-in-time handover. The living, detailed reference is
> [`CLAUDE.md`](CLAUDE.md) — read it for full architecture, design tokens, and
> command recipes. This file = "where things stand right now + what to do next."

---

## 1. What this is

A **digital wedding "Save the Date"** for **Sandro & Kopi**, married in **Syros,
Greece on 15 September 2026**. Mobile-first, **plain static HTML/CSS/JS** (no build,
no framework, no npm). Small, targeted guest list — favor simple/robust over heavy.

- **`/`** (`index.html`) — invitation: 3-screen scroll-snap (cover → island guessing
  game → the day + RSVP).
- **`/details`** (`details/index.html`) — guest guide (travel, ferries, hotel,
  ceremony, map, venue).

**Live:** https://wedding.khasia.ge · also https://sandrobetterfly.github.io/w_invitation/
**Repo:** `sandrobetterfly/w_invitation` (GitHub Pages, `main`, `/` root). **Treat
every change as production.**

---

## 2. Tech & layout (the short version)

Vanilla HTML/CSS/JS inline in single files. Google Fonts (Cormorant Garamond + Jost).
Hand-drawn line-art SVG icon sprite (`<symbol id="i-…">` → `<use>`). Canvas confetti.
RSVP → **Google Apps Script** web app → Google Sheet. Design tokens in `:root` —
accent/CTA is **`--gold` (coral `#FF7653`)** despite the name.

```
index.html              # main invitation (3 screens)
details/index.html      # guest guide  → served at /details
cover.jpg               # couple photo (home OG image)
syros-ermoupoli.webp    # /details header photo
og-image.jpg            # 1200×674 JPEG of Syros (/details OG image)
wedding.mp4             # screen-3 video
rsvp-apps-script.gs     # Apps Script source for RSVP→Sheet
CLAUDE.md · HANDOFF.md · README.md · .gitignore
.claude/                # dev-only, gitignored (serve.js preview server)
```

---

## 3. Current state

### ✅ Done & verified
- **Home:** cover photo in wavy frame, "Save the Date", date `15.09.2026`, doodles,
  **"GUEST GUIDE →"** pill → `/details`.
- **Island game:** tap to guess; Syros → dark blue + green pin + confetti; custom
  wrong-answer copy; boat-sail + tap-target hints; decorative overlays are
  `pointer-events:none` so the first Syros tap always registers.
- **The day:** "September 15th" header, looping autoplay video (plays **with sound**
  after first tap via iOS priming), RSVP popup (name + "who sent you?"),
  **one-RSVP-per-device** lock (localStorage). *(The countdown was removed
  2026-06-27 — RSVP is open-ended, no deadline.)*
- **`/details`:** header photo + colored top bar (`#3B82F6`), quick-links nav
  (Ferries · Church · Hotel · Timeline, smooth-scroll), ferry cards → ferryscanner,
  airport→port callout, date timeline, Apollonion Palace hotel (Maps link), Saint
  Nicholas ceremony (Maps link), **embedded OpenStreetMap** of Ermoupoli (marker on
  the church `37.4464,24.9449`) with overlay pin-cards + "Open in Google Maps" link,
  surprise venue card. Two home links.
- **Share previews (OG):** **home → `cover.jpg`** (couple photo, 800×1200);
  **`/details` → `og-image.jpg`** (Syros, 1200×674). Both JPEG (not WebP) so
  WhatsApp/iMessage render them.
- **Infra:** always opens on screen 1 (snap enabled only after `load`); perf-tuned
  (no fixed backgrounds); RSVP endpoint live; stress-tested across 50 device UAs.

### 🗺️ Map note (important nuance)
The embedded map is **OpenStreetMap**, but **every click-through link goes to Google
Maps** (the two overlay pin-cards + the "Open in Google Maps" link under the map).
This was deliberate — keep it that way.

### ⚠️ Config / pre-launch to-dos (not blocking)
1. **Apps Script "Sent by" column:** front-end sends `sender`; the *deployed* script
   must include it (updated code in `rsvp-apps-script.gs`). If it isn't populating →
   Apps Script → Deploy → **Manage deployments → edit → New version** (keeps `/exec`).
2. **Delete test rows** in the Google Sheet (50+ `Test 01…50` + older `TEST` rows).
3. **Re-scrape OG previews** after any deploy (see §5).

### ❌ Broken
Nothing. Accepted limitations: ~2% transient Apps Script failures under burst
(front-end is `no-cors`, can't detect — cross-check sheet vs guest list); RSVP lock
is per-browser; iPhone SE puts screen-3 slightly below the fold; true iOS audio
unlock needs a real-device check.

---

## 4. Immediate next steps (prioritized)

1. **Verify live OG previews** once Pages rebuilds — re-scrape both URLs (§5).
2. **Sheet hygiene** — delete the test RSVP rows.
3. **Verify "Sent by"** populates; redeploy `rsvp-apps-script.gs` if not (§3.1).
4. **Real-device QA** (headless preview can't fully validate): reload on iOS Safari +
   Android Chrome → must land on screen 1; tap island → screen-3 video plays with
   sound; RSVP keyboard doesn't cover fields; share link → correct preview card.
5. *(Optional)* Harden RSVP reliability (retry+dedupe or Google Form); fill venue
   details on `/details` once revealed.

---

## 5. Commands

**Local preview** (python http.server is sandbox-blocked here):
```bash
node .claude/serve.js          # http://localhost:4599  (serves /details dir index)
```
**No build. No test suite.** The files in the repo *are* the deploy artifact.

**Deploy:**
```bash
git add <files> && git commit -m "…"   # end msg with the Co-Authored-By line
git push origin main                    # GitHub Pages auto-builds (~1 min)
```

**Re-scrape share previews after deploy** — OG cards are cached per URL by
WhatsApp/Facebook/iMessage. In the Facebook Sharing Debugger
(https://developers.facebook.com/tools/debug/) hit **Scrape Again** for:
- `https://wedding.khasia.ge/`        → should show the couple photo
- `https://wedding.khasia.ge/details` → should show the Syros photo

**Media optimization** (no Homebrew — use bundled ffmpeg / sips):
```bash
# video → 540p H.264
FF=$(python3 -c "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())")
"$FF" -y -i "SOURCE.MOV" -vf "scale=540:-2,fps=30" -c:v libx264 -crf 26 -preset slow \
  -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k wedding.mp4
# photo / OG image → ~1200px JPEG
sips -Z 1200 -s format jpeg -s formatOptions 72 "SOURCE" --out out.jpg
```

---

## 6. Gotchas (don't relearn these the hard way)

- **macOS `core.ignorecase` is ON** — never use extension patterns like `*.JPG` in
  `.gitignore`; they also match `cover.jpg`. Ignore originals by exact name.
- **Don't put `scroll-snap-type` back in static CSS** — it lives on `html.snap`,
  enabled by JS only after `load`. Static snap reintroduces the "opens on screen 2
  after reload" bug.
- **OG images must be JPEG/PNG**, not WebP — WhatsApp/iMessage won't render WebP
  previews. The page can display `.webp`; the share tag points to a `.jpg`.
- **Keep the map embed OSM but all links Google** (§3).
- **No external JS deps, single self-contained files, design tokens first.** Commit
  messages end with `Co-Authored-By: Claude <noreply@anthropic.com>`.
